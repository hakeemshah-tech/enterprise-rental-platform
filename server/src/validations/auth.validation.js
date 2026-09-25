const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  password: z.string({ required_error: 'Password is required' }),
});

const verifyOtpSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

module.exports = { registerSchema, loginSchema, verifyOtpSchema };
