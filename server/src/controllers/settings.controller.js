const GlobalSettings = require('../models/GlobalSettings');
const path = require('path');
const fs = require('fs');
const {
  DEFAULT_MAPS_EMBED_URL,
  DEFAULT_BOOKING_PLATFORMS,
  DEFAULT_SOCIAL_LINKS,
} = require('../config/defaults');
const { isStoredFilename } = require('../utils/uploads.util');

const SINGLETON_KEY = 'global';
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'properties');

/**
 * Delete an uploaded file given its full URL or relative path.
 * Silently skips external URLs and non-existent files.
 *
 * The filename is taken from a URL stored in MongoDB, so it is only as
 * trustworthy as the admin account that wrote it. It is checked against the
 * shape this API itself generates before it is ever joined to a path: the
 * capture group excludes '/' but not '\' or '..', and `path.join` treats a
 * backslash as a separator on Windows, which would otherwise turn this into
 * an unlink primitive outside the uploads directory.
 */
function deleteUploadedFile(url) {
  if (!url) return;
  try {
    // Extract filename from URL like "http://localhost:5000/uploads/properties/xxx.png"
    const match = url.match(/\/uploads\/properties\/([^/?#]+)/);
    if (!match) return; // External URL, skip
    if (!isStoredFilename(match[1])) return; // Not a name this API wrote
    const filePath = path.join(UPLOADS_DIR, match[1]);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Silently ignore: file may already be gone
  }
}

/**
 * Collect all image URLs currently in settings (hero slides + partner logos).
 */
function collectImageUrls(settings) {
  const urls = new Set();
  if (settings.hero) {
    for (const slide of settings.hero) {
      if (slide.imageUrl) urls.add(slide.imageUrl);
    }
  }
  if (settings.partners) {
    for (const p of settings.partners) {
      if (p.logoUrl) urls.add(p.logoUrl);
    }
  }
  if (settings.bookingPlatforms) {
    for (const bp of settings.bookingPlatforms) {
      if (bp.logoUrl) urls.add(bp.logoUrl);
    }
  }
  return urls;
}

/**
 * Auto-migrate legacy data formats directly in MongoDB
 * so the document passes current schema validation.
 * Uses raw collection queries to bypass Mongoose casting.
 *  - coreServices: old format was string[], new format is [{ name, icon }]
 */
async function migrateIfNeeded() {
  const collection = GlobalSettings.collection;
  const raw = await collection.findOne({ key: SINGLETON_KEY });
  if (!raw) return;

  const updates = {};

  // Migrate coreServices from string[] to [{ name, icon }]
  const services = raw.aboutContent?.coreServices;
  if (Array.isArray(services) && services.length > 0 && typeof services[0] === 'string') {
    const defaultIcons = ['Building2', 'TrendingUp', 'MapPin', 'Lightbulb', 'Target'];
    updates['aboutContent.coreServices'] = services.map((s, i) => ({
      name: s,
      icon: defaultIcons[i] || '',
    }));
  }

  // Migrate googleMapsEmbedUrl from nested companyInfo to top-level
  if (!raw.googleMapsEmbedUrl) {
    updates['googleMapsEmbedUrl'] = raw.companyInfo?.googleMapsEmbedUrl || DEFAULT_MAPS_EMBED_URL;
  }

  // Migrate: add default bookingPlatforms if missing
  if (!raw.bookingPlatforms || raw.bookingPlatforms.length === 0) {
    updates['bookingPlatforms'] = DEFAULT_BOOKING_PLATFORMS;
  }

  // Migrate: add default socialLinks if missing
  if (!raw.socialLinks) {
    updates['socialLinks'] = DEFAULT_SOCIAL_LINKS;
  }

  if (Object.keys(updates).length > 0) {
    await collection.updateOne({ key: SINGLETON_KEY }, { $set: updates });
  }
}

/**
 * @desc    Get global settings (creates defaults if none exist)
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res, next) => {
  try {
    // Migrate legacy data in raw MongoDB before Mongoose loads/casts it
    await migrateIfNeeded();

    let settings = await GlobalSettings.findOne({ key: SINGLETON_KEY });

    if (!settings) {
      settings = await GlobalSettings.create({ key: SINGLETON_KEY });
    }

    // Strip audit log from public response (admins get it separately)
    const { auditLog, ...publicData } = settings.toObject();

    // If caller is admin, include audit log
    const isAdmin = req.user && req.user.role === 'admin';

    res.json({
      success: true,
      data: isAdmin ? settings : publicData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update global settings (partial, PATCH semantics)
 * @route   PATCH /api/settings
 * @access  Private/Admin
 */
const updateSettings = async (req, res, next) => {
  try {
    // Migrate legacy data in raw MongoDB before Mongoose loads/casts it
    await migrateIfNeeded();

    let settings = await GlobalSettings.findOne({ key: SINGLETON_KEY });

    if (!settings) {
      settings = await GlobalSettings.create({ key: SINGLETON_KEY });
    }

    // Determine which sections are being updated for audit
    const updatedSections = Object.keys(req.body).filter((k) => k !== 'auditLog');

    // Snapshot current image URLs BEFORE applying patches
    const oldImageUrls = collectImageUrls(settings);

    // Apply updates: merge nested objects, replace arrays and primitives
    for (const key of updatedSections) {
      const incoming = req.body[key];
      if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
        // Merge: spread existing first, then incoming overrides
        const existing = settings.toObject()[key] || {};
        settings.set(key, { ...existing, ...incoming });
      } else {
        settings.set(key, incoming);
      }
      settings.markModified(key);
    }

    // Find orphaned images (were in old data but not in new) and delete from disk
    const newImageUrls = collectImageUrls(settings);
    for (const oldUrl of oldImageUrls) {
      if (!newImageUrls.has(oldUrl)) {
        deleteUploadedFile(oldUrl);
      }
    }

    // Push audit entries (cap at 50)
    const auditEntry = {
      adminId: req.user._id,
      adminName: req.user.name,
      section: updatedSections.join(', '),
      action: 'updated',
      timestamp: new Date(),
    };

    settings.auditLog.push(auditEntry);
    if (settings.auditLog.length > 50) {
      settings.auditLog = settings.auditLog.slice(-50);
    }

    await settings.save();

    // Direct MongoDB write for googleMapsEmbedUrl: bypasses Mongoose document issues
    if (req.body.googleMapsEmbedUrl !== undefined) {
      await GlobalSettings.collection.updateOne(
        { key: SINGLETON_KEY },
        { $set: { googleMapsEmbedUrl: req.body.googleMapsEmbedUrl } }
      );
    }

    // Reload to get the correct data after raw update
    settings = await GlobalSettings.findOne({ key: SINGLETON_KEY });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
