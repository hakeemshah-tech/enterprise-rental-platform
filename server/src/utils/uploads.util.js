/**
 * Upload naming policy: one definition, used by both the writer and the
 * deleters.
 *
 * `upload.controller.js` generates stored filenames; `property.controller.js`
 * and `settings.controller.js` unlink them again when an image is dropped from
 * a gallery. The deleters take their filename from a URL held in MongoDB, so
 * the value is attacker-influenced whenever an admin account is. Both sides
 * therefore agree on exactly one shape, defined here, rather than each
 * controller carrying its own idea of what a safe filename looks like.
 */

/**
 * Extensions we are willing to write to disk, paired to the MIME allowlist in
 * `upload.controller.js`. Anything else is discarded rather than trusted, so a
 * stored file can never carry an extension that `express.static` would serve
 * as script.
 */
const ALLOWED_EXTENSIONS = Object.freeze(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

/**
 * The only shape `generateStoredFilename()` can produce: a millisecond
 * timestamp, a hyphen, 16 hex characters, and optionally one allowlisted
 * extension. Anchored at both ends, so a candidate containing a separator, a
 * traversal sequence, a null byte or a newline cannot match.
 */
const STORED_FILENAME_PATTERN = new RegExp(
  `^\\d+-[0-9a-f]{16}(?:${ALLOWED_EXTENSIONS.map((ext) => ext.replace('.', '\\.')).join('|')})?$`
);

/**
 * Is this string a filename this API itself wrote?
 *
 * Used as an allowlist before any `path.join` on the uploads directory.
 * Checking the whole string is what makes the guard platform-independent:
 * `path.join` treats a backslash as a separator on Windows and as an ordinary
 * character on Linux, so probing for individual bad characters gives different
 * answers per host. A name that did not come out of this API is simply not
 * ours to touch.
 *
 * @param {unknown} candidate
 * @returns {boolean}
 */
function isStoredFilename(candidate) {
  return typeof candidate === 'string' && STORED_FILENAME_PATTERN.test(candidate);
}

module.exports = {
  ALLOWED_EXTENSIONS,
  STORED_FILENAME_PATTERN,
  isStoredFilename,
};
