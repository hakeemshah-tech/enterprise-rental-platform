const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateSettingsSchema } = require('../validations/settings.validation');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

// GET /api/settings: public (but adds user info if authed)
router.get(
  '/',
  // Optionally attach user if token present (non-blocking)
  async (req, res, next) => {
    try {
      if (req.headers.authorization) {
        await protect(req, res, () => {});
      }
    } catch {
      // Ignore auth errors: public route
    }
    next();
  },
  getSettings
);

// PATCH /api/settings: admin only
router.patch('/', protect, authorize('admin'), validate(updateSettingsSchema), updateSettings);

module.exports = router;
