/**
 * Upload controller: handles multipart/form-data via multer.
 *
 * Files land on the local disk under /uploads/properties/ and the
 * controller answers with absolute URLs. Storage is deliberately
 * pluggable: swapping `multer.diskStorage` for an object-store engine
 * (S3, R2, GCS) is the only change required; the wire contract the
 * client consumes (`{ url, alt }[]`) stays identical.
 *
 * Full walkthrough: docs/ASSET_PIPELINE.md
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// ── Policy (exported so the test suite asserts against one source) ──

/** Raster formats the API accepts. Anything else is rejected outright. */
const ALLOWED_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

/** Per-file ceiling, enforced by multer while the stream is consumed. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Per-request ceiling on the `images` field. */
const MAX_FILES_PER_REQUEST = 10;

/** Public path prefix the stored files are served from. */
const PUBLIC_PATH_PREFIX = '/uploads/properties';

// Extension allowlist and the resulting filename shape live in one module,
// shared with the controllers that delete these files again.
const { ALLOWED_EXTENSIONS } = require('../utils/uploads.util');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Build the on-disk name for an upload.
 *
 * The client-supplied filename is never reused as a path: only an
 * allowlisted extension survives, appended to a timestamp plus 64 bits of
 * entropy. That defeats path traversal, collisions and name-based
 * enumeration, and it stops a hostile name from choosing the extension that
 * `express.static` will later use to pick a Content-Type.
 *
 * Separator stripping is done by hand rather than through `path.basename`,
 * because `path` is platform-bound: on Linux a backslash is an ordinary
 * filename character, so `path.extname('..\\..\\etc\\sam')` returns
 * '.\\windows\\...' there while returning '' on Windows. Splitting on both
 * separators makes the result identical on every platform.
 *
 * @param {string} originalName filename as supplied by the browser
 * @returns {string} e.g. "1774255135667-cd0cf45a08d62982.png"
 */
function generateStoredFilename(originalName) {
  const uniqueSuffix = crypto.randomBytes(8).toString('hex');

  // Last segment after any '/' or '\', whatever the host OS thinks of them.
  const basename = String(originalName || '')
    .split(/[/\\]/)
    .pop();

  // `lastIndexOf > 0` keeps dotfile semantics: '.bashrc' has no extension.
  const dot = basename.lastIndexOf('.');
  const candidate = dot > 0 ? basename.slice(dot).toLowerCase() : '';
  const ext = ALLOWED_EXTENSIONS.includes(candidate) ? candidate : '';

  return `${Date.now()}-${uniqueSuffix}${ext}`;
}

/**
 * multer file filter: MIME allowlist (never an extension denylist).
 */
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, AVIF) are allowed'), false);
  }
}

// Storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, generateStoredFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_REQUEST },
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload
 * @access  Private/Admin
 */
const uploadImages = (req, res, next) => {
  const uploader = upload.array('images', MAX_FILES_PER_REQUEST);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max 5 MB per image.' : err.message,
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = req.files.map((file) => ({
      url: `${baseUrl}${PUBLIC_PATH_PREFIX}/${file.filename}`,
      alt: file.originalname,
    }));

    res.json({ success: true, data: images });
  });
};

module.exports = {
  uploadImages,
  // Exported for the contract tests in server/test/
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_REQUEST,
  PUBLIC_PATH_PREFIX,
  generateStoredFilename,
  fileFilter,
};
