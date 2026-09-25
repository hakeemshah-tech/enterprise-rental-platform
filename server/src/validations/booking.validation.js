const { z } = require('zod');

const createBookingSchema = z.object({
  property: z.string({ required_error: 'Property ID is required' }),
  checkIn: z.string({ required_error: 'Check-in date is required' }),
  checkOut: z.string({ required_error: 'Check-out date is required' }),
  guests: z.object({
    adults: z.number({ required_error: 'Number of adults is required' }).int().min(1),
    children: z.number().int().min(0).optional().default(0),
  }),
  specialRequests: z.string().max(500).optional().default(''),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
    required_error: 'Status is required',
  }),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
});

module.exports = { createBookingSchema, updateBookingStatusSchema };
