const router = require('express').Router();
const { uploadImages } = require('../controllers/upload.controller');
const { protect, authorize } = require('../middleware/auth');

// POST /api/upload: upload images (admin only)
router.post('/', protect, authorize('admin'), uploadImages);

module.exports = router;
