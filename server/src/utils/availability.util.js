const Booking = require('../models/Booking');
const Property = require('../models/Property');

/**
 * Check if a property is available for the given date range.
 * Checks both confirmed bookings AND admin-blocked dates.
 *
 * @returns {{ available: boolean, conflicts: Array }}
 */
async function checkAvailability(propertyId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const conflicts = [];

  // 1. Check overlapping bookings (non-cancelled)
  const overlappingBookings = await Booking.find({
    property: propertyId,
    status: { $nin: ['cancelled'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  }).select('checkIn checkOut status');

  for (const b of overlappingBookings) {
    conflicts.push({
      type: 'booking',
      startDate: b.checkIn,
      endDate: b.checkOut,
      status: b.status,
    });
  }

  // 2. Check admin-blocked dates
  const property = await Property.findById(propertyId).select('blockedDates');
  if (property?.blockedDates) {
    for (const block of property.blockedDates) {
      if (block.startDate < end && block.endDate > start) {
        conflicts.push({
          type: 'blocked',
          startDate: block.startDate,
          endDate: block.endDate,
          reason: block.reason,
          _id: block._id,
        });
      }
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Get all unavailable date ranges for a property (bookings + blocks).
 * Used by the calendar UI.
 */
async function getUnavailableDates(propertyId) {
  const ranges = [];

  // Confirmed/pending bookings (from today onward)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await Booking.find({
    property: propertyId,
    status: { $nin: ['cancelled'] },
    checkOut: { $gte: today },
  }).select('checkIn checkOut status');

  for (const b of bookings) {
    ranges.push({
      type: 'booking',
      startDate: b.checkIn,
      endDate: b.checkOut,
      status: b.status,
    });
  }

  // Admin blocks
  const property = await Property.findById(propertyId).select('blockedDates');
  if (property?.blockedDates) {
    for (const block of property.blockedDates) {
      if (block.endDate >= today) {
        ranges.push({
          type: 'blocked',
          startDate: block.startDate,
          endDate: block.endDate,
          reason: block.reason,
          _id: block._id,
        });
      }
    }
  }

  return ranges;
}

module.exports = { checkAvailability, getUnavailableDates };
