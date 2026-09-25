# Asset Pipeline: Multipart Handling for Property Media

How a property photograph travels from an admin's file picker to a CDN-able URL
rendered by `next/image`, and which component owns each guarantee along the way.

> **Scope.** This covers binary assets only (property galleries, hero slides,
> partner and platform logos). JSON payloads take the ordinary
> `express.json()` → Zod → Mongoose path described in the root README.

---

## 1. Why uploads are a two-phase commit

The obvious design (post the property form and its images together as one
multipart request) is not what this system does. Creating a listing is two
distinct API calls:

| Phase | Request                                     | Result                                       |
| ----- | ------------------------------------------- | -------------------------------------------- |
| 1     | `POST /api/upload` (`multipart/form-data`)  | Files land on disk; returns `{ url, alt }[]` |
| 2     | `POST /api/properties` (`application/json`) | Listing document stores those URLs           |

Three reasons this separation is worth the extra round trip:

1. **The JSON contract stays pure.** `createPropertySchema` validates a plain
   object. No controller has to reason about a request that is half-parsed
   fields and half-consumed streams, and the Zod schema stays the single
   description of a listing.
2. **Retries are cheap.** A validation failure in phase 2 (a title two
   characters too short) does not force the admin to re-upload 10 MB of
   photographs. The URLs are already durable and the form resubmits as JSON.
3. **Storage is swappable.** Phase 1 is the _only_ code that knows files exist
   on a local disk. Replacing `multer.diskStorage` with an S3/R2 engine changes
   one module; every other layer keeps handling opaque URL strings.

The cost is orphaned files when phase 2 never happens (addressed in §6).

---

## 2. Client: staging files before they are sent

`client/src/components/ui/ImageUpload.tsx` is a controlled component over
`ImageFile[]`. A picked or dropped file is held in memory as a `File` plus an
`URL.createObjectURL()` preview; **nothing is transmitted on selection**.

```ts
type ImageFile = {
  file?: File; // present  → not yet uploaded
  url: string; // present  → already on the server
  alt: string;
  preview?: string; // object URL, revoked on removal
};
```

That `file` vs. `url` discriminator is what makes the edit screen work: an
existing listing loads with `url`-only entries, and only newly added entries
carry a `file`. On submit
(`client/src/app/admin/properties/[id]/edit/page.tsx`) the two sets are split,
the new ones uploaded, and the results concatenated in gallery order:

```ts
const filesToUpload = images.filter((img) => img.file);
const existingImages = images.filter((img) => !img.file && img.url);

const formData = new FormData();
filesToUpload.forEach((img) => img.file && formData.append("images", img.file));

const uploadRes = await api.post("/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

const allImages = [...existingImages, ...uploadRes.data.data];
```

Every entry is appended under the **same** field name, `images`; that is what
lets multer collect them into `req.files` as an array. Object URLs are revoked
when a preview is removed, so a long editing session does not leak blobs.

The shared axios instance (`client/src/lib/api.ts`) attaches
`Authorization: Bearer <token>` through a request interceptor, so the upload
call is authenticated exactly like every other call without special handling.

---

## 3. Transport: the route's defence in depth

```js
// server/src/routes/upload.routes.js
router.post("/", protect, authorize("admin"), uploadImages);
```

The order matters. Both guards run **before** multer touches the stream, so an
anonymous or non-admin request is rejected at the headers and never writes a
byte to disk.

| Layer          | Control                                        | Where                              |
| -------------- | ---------------------------------------------- | ---------------------------------- |
| Rate limit     | 500 requests / 15 min per IP across `/api`     | `src/index.js`                     |
| Authentication | `protect`: verifies the JWT, loads the user    | `middleware/auth.js`               |
| Authorization  | `authorize('admin')`: role gate, 403 otherwise | `middleware/auth.js`               |
| Type allowlist | `fileFilter`: MIME allowlist                   | `controllers/upload.controller.js` |
| Size ceiling   | 5 MB per file, enforced mid-stream             | `controllers/upload.controller.js` |
| Count ceiling  | 10 files per request                           | `controllers/upload.controller.js` |

`express.json({ limit: '10mb' })` never sees these requests: it ignores
non-JSON content types, and multer consumes the multipart body itself.

---

## 4. Validation and naming

```js
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;
```

**It is an allowlist, not a denylist.** A file is accepted because its type is
named, never because it failed to match a list of bad extensions. `image/svg+xml`
is deliberately absent: SVG is an XML document that can carry script, and these
files are served from the API's own origin.

Stored names are generated, never borrowed:

```js
function generateStoredFilename(originalName) {
  const uniqueSuffix = crypto.randomBytes(8).toString("hex");

  // Last segment after any '/' or '\', whatever the host OS thinks of them.
  const basename = String(originalName || "")
    .split(/[/\\]/)
    .pop();

  // `lastIndexOf > 0` keeps dotfile semantics: '.bashrc' has no extension.
  const dot = basename.lastIndexOf(".");
  const candidate = dot > 0 ? basename.slice(dot).toLowerCase() : "";
  const ext = ALLOWED_EXTENSIONS.includes(candidate) ? candidate : "";

  return `${Date.now()}-${uniqueSuffix}${ext}`; // 1774255135667-cd0cf45a08d62982.png
}
```

Only an **allowlisted extension** survives contact with user input. Everything
else is a timestamp plus 64 bits of entropy, so the output always matches
`/^\d+-[0-9a-f]{16}(\.(jpg|jpeg|png|gif|webp|avif))?$/`. That buys five
properties at once:

- **No path traversal.** Separators are stripped before anything else happens,
  so `../../etc/passwd` cannot escape the upload directory.
- **No attacker-chosen Content-Type.** `express.static` picks a MIME type from
  the extension. Discarding unlisted extensions means a name like
  `photo.png/../../evil.js` cannot cause a stored file to be served as
  JavaScript from the API's own origin. The MIME filter in §4 and this
  allowlist are deliberately independent controls.
- **No collisions.** Two admins uploading `IMG_0001.jpg` in the same
  millisecond get distinct names.
- **No enumeration.** Names are not sequential, so the gallery of an unlisted
  property cannot be walked by guessing URLs.
- **No metadata leak** in the path itself.

> **Why the manual split instead of `path.basename`.** The `path` module is
> platform-bound. On Linux a backslash is an ordinary filename character, so
> `path.extname('..\\..\\config\\sam')` returns `'.\\windows\\...'` there while
> returning `''` on Windows. A generator built on `path` therefore produces
> different filenames per host, which is how this first surfaced: the suite was
> green on a Windows workstation and red on the Linux CI runner. Splitting on
> both separators by hand makes the result identical everywhere.

All of the above is covered by `server/test/upload.pipeline.test.js`, including
hostile filenames, disallowed extensions, and a cross-platform shape assertion.

Multer error codes are translated to user-facing messages before they leave the
controller: `LIMIT_FILE_SIZE` becomes _"File too large. Max 5 MB per image."_
rather than a stack trace.

---

## 5. Storage and delivery

Files are written to `server/uploads/properties/`. The directory is created at
boot (`fs.mkdirSync(..., { recursive: true })`), so a fresh clone needs no
setup step. It is tracked in git **only** as `.gitkeep`; the master
`.gitignore` excludes its contents, because production media is tenant data and
belongs in neither a repository nor a portfolio snapshot.

The response is absolute, built from the live request:

```js
const baseUrl = `${req.protocol}://${req.get("host")}`;
// → { url: 'http://localhost:5000/uploads/properties/1774…-cd0c….png', alt: 'front.jpg' }
```

Absolute URLs mean the stored value is directly renderable from any origin the
Next.js app is served on, and moving to a CDN later is a change of `baseUrl`
rather than a data migration.

Delivery involves two deliberate configuration choices:

```js
// server/src/index.js: Helmet's default CORP header would block the
// cross-origin <img> load from :3000, so uploads opt into cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
```

```ts
// client/next.config.ts: next/image refuses unknown hosts by design.
images: {
  remotePatterns: [
    { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
  ],
},
```

> **Deployment note.** `remotePatterns` is an allowlist. Pointing the client at
> a deployed API without adding that host here produces the "hostname is not
> configured under images" error; this is the first thing to check when
> images render locally but not in staging.

---

## 6. Lifecycle: orphan collection

Because uploads are committed before the listing that references them, files can
outlive their referent. Two controllers reconcile this on every write, using the
same strategy: snapshot the URLs _before_ applying the change, diff against the
URLs after, and unlink whatever is no longer reachable.

```js
const oldUrls = new Set((oldProperty.images || []).map((img) => img.url));
// … apply update …
const newUrls = new Set((property.images || []).map((img) => img.url));
for (const url of oldUrls) if (!newUrls.has(url)) deleteUploadedFile(url);
```

| Trigger                      | Handler                  | Behaviour                                                |
| ---------------------------- | ------------------------ | -------------------------------------------------------- |
| `PUT /api/properties/:id`    | `property.controller.js` | Removes images dropped from the gallery                  |
| `DELETE /api/properties/:id` | `property.controller.js` | Removes the whole gallery                                |
| `PATCH /api/settings`        | `settings.controller.js` | Removes replaced hero slides, partner and platform logos |

`deleteUploadedFile()` extracts the filename with
`/\/uploads\/properties\/([^/?#]+)/`, checks it with `isStoredFilename()`, and
only then resolves it against the upload directory. A URL that does not match
(any externally hosted image) is skipped rather than treated as a local path.
Missing files are ignored: deletion is
idempotent by design, so a retried request cannot fail on an already-collected
file.

> **Why the name is re-validated on the way out.** The URL being parsed here
> comes from a MongoDB document, so it is only as trustworthy as the admin
> account that wrote it. The capture group excludes `/` but not `\` or `..`,
> and `path.join` treats a backslash as a separator on Windows: without the
> `isStoredFilename()` check, a stored URL ending
> `/uploads/properties/..\..\package.json` resolved to a real file outside the
> upload directory and would have been unlinked. The guard and the generator
> share one definition in `server/src/utils/uploads.util.js`, so the writer and
> the deleter cannot drift apart.

**Not covered:** a phase-1 upload whose phase 2 never arrives (the admin closes
the tab mid-form). Those files are unreferenced and currently persist. A
periodic sweep comparing the directory against the URL set in Mongo is the
standard remedy; it is not implemented here.

---

## 7. Known limitations

Honest boundaries of the current implementation, in rough priority order:

0. **`multer@1.x` is end-of-life.** npm flags the pinned version as
   _"impacted by a number of vulnerabilities, which have been patched in
   2.x"_. Upgrading is the single highest-value change in this document. The
   2.x API is close to compatible with the usage here (`diskStorage`,
   `fileFilter` and `limits` all survive), so the migration is small and
   covered by `server/test/upload.pipeline.test.js`.
1. **MIME type is client-asserted.** `file.mimetype` comes from the request
   headers. The extension allowlist plus generated filenames mean a mislabelled
   file is stored inertly rather than executed, but magic-byte sniffing (e.g.
   `file-type`) before the write is the correct hardening step.
2. **No image re-encoding.** Passing uploads through `sharp` would strip EXIF
   (including GPS coordinates from a phone camera), normalise dimensions and
   neutralise malformed-decoder payloads in one pass. Today the original bytes
   are stored as received.
3. **`alt` is the original filename.** Convenient for the admin UI, but it
   echoes whatever the uploader's file was called back to every public visitor.
   Prompting for real alt text would serve both privacy and accessibility.
4. **Local disk does not scale horizontally.** Two API instances behind a load
   balancer do not share `server/uploads`. This is the primary motivation for
   the object-store swap described in §1.
5. **No malware scanning.** Acceptable for an admin-only endpoint; revisit
   immediately if uploads are ever opened to tenants.
6. **No per-user upload quota.** The global rate limiter is the only backstop
   against an authenticated admin filling the disk.
