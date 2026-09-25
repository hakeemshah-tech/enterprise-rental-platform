const { z } = require('zod');

const createEnquirySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  phone: z.string().optional().default(''),
  property: z.string().optional().nullable(),
  subject: z.string().max(100).optional().default('General Enquiry'),
  message: z
    .string({ required_error: 'Message is required' })
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

module.exports = { createEnquirySchema };
