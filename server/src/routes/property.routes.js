const router = require('express').Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertyAvailability,
  blockDates,
  unblockDates,
} = require('../controllers/property.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createPropertySchema,
  updatePropertySchema,
} = require('../validations/property.validation');

// Public routes
router.get('/featured', getFeaturedProperties);
router.get('/', getProperties);
router.get('/:id', getProperty);
router.get('/:id/availability', getPropertyAvailability);

// Admin routes
router.post('/', protect, authorize('admin'), validate(createPropertySchema), createProperty);
router.put('/:id', protect, authorize('admin'), validate(updatePropertySchema), updateProperty);
router.delete('/:id', protect, authorize('admin'), deleteProperty);
router.post('/:id/block-dates', protect, authorize('admin'), blockDates);
router.delete('/:id/unblock-dates', protect, authorize('admin'), unblockDates);

module.exports = router;
