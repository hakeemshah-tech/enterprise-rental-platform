/**
 * Property API: asset pipeline tests.
 *
 * Covers the two pieces of the multipart upload path that carry the
 * security weight: the MIME allowlist and the filename generator that
 * refuses to trust anything the browser sent.
 *
 * Narrative version: docs/ASSET_PIPELINE.md
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_REQUEST,
  PUBLIC_PATH_PREFIX,
  generateStoredFilename,
  fileFilter,
} = require('../src/controllers/upload.controller');
const { isStoredFilename, STORED_FILENAME_PATTERN } = require('../src/utils/uploads.util');

/**
 * The only shape a stored filename may ever take, on any platform:
 * a timestamp, a hyphen, 16 hex characters, and optionally one
 * allowlisted image extension. Asserting the whole string rather than
 * probing for individual bad characters is what makes this suite
 * platform-independent: `path.extname` disagrees between Windows and
 * Linux on names containing backslashes.
 */
const SAFE_FILENAME = /^\d+-[0-9a-f]{16}(\.(jpg|jpeg|png|gif|webp|avif))?$/;

/** Run the multer filter and capture its (err, accepted) callback. */
const filter = (mimetype) => {
  let outcome;
  fileFilter({}, { mimetype, originalname: 'photo.png' }, (err, accepted) => {
    outcome = { err, accepted };
  });
  return outcome;
};

// ── Policy constants ──────────────────────────────────────────

test('upload limits match the documented policy', () => {
  assert.equal(MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024);
  assert.equal(MAX_FILES_PER_REQUEST, 10);
  assert.equal(PUBLIC_PATH_PREFIX, '/uploads/properties');
});

// ── MIME allowlist ────────────────────────────────────────────

test('every allowlisted image type is accepted', () => {
  for (const mimetype of ALLOWED_MIME_TYPES) {
    const { err, accepted } = filter(mimetype);
    assert.equal(err, null, `${mimetype} should not error`);
    assert.equal(accepted, true, `${mimetype} should be accepted`);
  }
});

test('executables, documents and archives are rejected', () => {
  const dangerous = [
    'application/x-msdownload',
    'application/javascript',
    'text/html',
    'image/svg+xml', // scriptable, deliberately excluded from the allowlist
    'application/pdf',
    'application/zip',
  ];

  for (const mimetype of dangerous) {
    const { err, accepted } = filter(mimetype);
    assert.ok(err instanceof Error, `${mimetype} should be rejected`);
    assert.equal(accepted, false);
    assert.match(err.message, /Only image files/);
  }
});

test('the filter is an allowlist, not an extension denylist', () => {
  // A .png filename with a non-image MIME type must still be refused.
  let outcome;
  fileFilter({}, { mimetype: 'text/html', originalname: 'innocent.png' }, (err, accepted) => {
    outcome = { err, accepted };
  });

  assert.ok(outcome.err instanceof Error);
  assert.equal(outcome.accepted, false);
});

// ── Stored filename generation ────────────────────────────────

test('stored filenames keep only the extension of the uploaded file', () => {
  const name = generateStoredFilename('Beach House Front.JPG');

  assert.match(name, /^\d+-[0-9a-f]{16}\.jpg$/);
  assert.ok(!name.includes(' '), 'no whitespace may survive');
  assert.ok(!/beach/i.test(name), 'the original name must not leak into storage');
});

test('path traversal in the supplied filename cannot escape the upload directory', () => {
  for (const hostile of [
    '../../../../etc/passwd',
    '..\\..\\windows\\system32\\config\\sam',
    '/etc/shadow',
    'photo.png/../../evil.js',
    'a/b\\c/../../../etc/passwd.png',
    '....//....//etc/passwd',
  ]) {
    const name = generateStoredFilename(hostile);
    assert.match(name, SAFE_FILENAME, `"${hostile}" produced an unsafe filename`);
  }
});

test('an extension outside the image allowlist is discarded, not stored', () => {
  // The MIME filter already blocks these uploads, but the two controls are
  // independent: a name must never be able to pick the extension that
  // express.static uses to choose a Content-Type.
  for (const hostile of [
    'payload.js',
    'payload.html',
    'payload.svg',
    'payload.php',
    'photo.png/../../evil.js',
    'archive.tar.gz',
  ]) {
    const name = generateStoredFilename(hostile);
    assert.match(name, /^\d+-[0-9a-f]{16}$/, `"${hostile}" kept a disallowed extension`);
  }
});

test('every allowlisted extension is preserved and lower-cased', () => {
  for (const ext of ALLOWED_EXTENSIONS) {
    const name = generateStoredFilename(`holiday${ext.toUpperCase()}`);
    assert.ok(name.endsWith(ext), `${ext} should survive, got ${name}`);
    assert.match(name, SAFE_FILENAME);
  }
});

test('stored filenames are identical in shape on every platform', () => {
  // Regression guard: this suite runs on Windows locally and Linux in CI.
  // `path.extname` disagrees on backslash-bearing names between the two, so
  // the generator deliberately does not use it.
  const crossPlatform = [
    'C:\\Users\\admin\\Pictures\\villa.png',
    '/home/admin/pictures/villa.png',
    'villa.png',
    '.hidden',
    '..',
    '',
  ];

  for (const input of crossPlatform) {
    assert.match(generateStoredFilename(input), SAFE_FILENAME, `input: "${input}"`);
  }

  assert.ok(generateStoredFilename('C:\\Users\\admin\\villa.png').endsWith('.png'));
  assert.ok(generateStoredFilename('/home/admin/villa.png').endsWith('.png'));
});

test('a filename with no extension still yields a usable name', () => {
  const name = generateStoredFilename('screenshot');
  assert.match(name, /^\d+-[0-9a-f]{16}$/);
});

test('a missing filename does not throw', () => {
  assert.match(generateStoredFilename(undefined), /^\d+-[0-9a-f]{16}$/);
});

test('consecutive uploads within the same millisecond do not collide', () => {
  const names = new Set();
  for (let i = 0; i < 500; i += 1) {
    names.add(generateStoredFilename('photo.png'));
  }
  assert.equal(names.size, 500);
});

// ── Deletion guard ────────────────────────────────────────────
//
// `deleteUploadedFile()` in property.controller.js and
// settings.controller.js pulls a filename out of a URL held in MongoDB and
// joins it to the uploads directory. The URL is only as trustworthy as the
// admin account that wrote it, so the name is matched against the shape this
// API itself produces before any path is built.

test('the writer and the deletion guard agree on one shape', () => {
  // Whatever the generator emits must be accepted by the guard, or a legitimate
  // image would leak on disk forever when its gallery entry is removed.
  for (const input of ['villa.png', 'villa.JPEG', 'no-extension', 'a.b.c.webp', '']) {
    const produced = generateStoredFilename(input);
    assert.ok(isStoredFilename(produced), `guard rejected a name it wrote: ${produced}`);
  }
});

test('the deletion guard rejects traversal, separators and control characters', () => {
  const hostile = [
    '..',
    '../../etc/passwd',
    '..\\..\\server.js', // Windows separator: the original vulnerability
    '..\\..\\..\\package.json',
    'C:\\Windows\\System32\\drivers\\etc\\hosts',
    '1774255135667-cd0cf45a08d62982.png\\..\\..\\index.js',
    '1774255135667-cd0cf45a08d62982.png/../../index.js',
    '1774255135667-cd0cf45a08d62982.png\u0000.txt', // null byte truncation
    '1774255135667-cd0cf45a08d62982.png\n',
    '.env',
    'index.js',
  ];

  for (const candidate of hostile) {
    assert.equal(
      isStoredFilename(candidate),
      false,
      `guard accepted a hostile filename: ${JSON.stringify(candidate)}`
    );
  }
});

test('the deletion guard rejects near-miss names it did not write', () => {
  const nearMisses = [
    '1774255135667-cd0cf45a08d62982.js', // extension outside the allowlist
    '1774255135667-cd0cf45a08d62982.exe',
    '1774255135667-ZZZZZZZZZZZZZZZZ.png', // not hex
    '1774255135667-cd0cf45a08d6298.png', // 15 hex characters
    '1774255135667-cd0cf45a08d629821.png', // 17 hex characters
    'cd0cf45a08d62982.png', // no timestamp
    '1774255135667-cd0cf45a08d62982', // valid: extensionless, checked below
  ];

  for (const candidate of nearMisses.slice(0, -1)) {
    assert.equal(isStoredFilename(candidate), false, `guard accepted: ${candidate}`);
  }

  // The extensionless form is legitimate: uploads with no extension exist.
  assert.equal(isStoredFilename('1774255135667-cd0cf45a08d62982'), true);
});

test('the deletion guard only accepts strings', () => {
  for (const candidate of [null, undefined, 42, {}, [], true]) {
    assert.equal(isStoredFilename(candidate), false, `guard accepted ${typeof candidate}`);
  }
});

test('the guard pattern is anchored at both ends', () => {
  // An unanchored pattern would accept a hostile prefix or suffix.
  assert.equal(STORED_FILENAME_PATTERN.source.startsWith('^'), true);
  assert.equal(STORED_FILENAME_PATTERN.source.endsWith('$'), true);
  assert.equal(STORED_FILENAME_PATTERN.global, false, 'a global regex carries lastIndex state');
});
