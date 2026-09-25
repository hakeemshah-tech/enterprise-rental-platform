const router = require('express').Router();
const {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiry.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEnquirySchema } = require('../validations/enquiry.validation');

// Public
router.post('/', validate(createEnquirySchema), createEnquiry);

// Admin
router.get('/', protect, authorize('admin'), getEnquiries);
router.put('/:id', protect, authorize('admin'), updateEnquiryStatus);

module.exports = router;
