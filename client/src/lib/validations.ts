import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────
export const registerSchema = z
    .object({
        name: z
            .string({ error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters'),
        email: z.string({ error: 'Email is required' }).email('Please provide a valid email'),
        password: z
            .string({ error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string({ error: 'Please confirm your password' }),
        phone: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export const loginSchema = z.object({
    email: z.string({ error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ error: 'Password is required' }),
});

// ─── Property ─────────────────────────────────────
export const propertySchema = z.object({
    title: z
        .string({ error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(120),
    description: z
        .string({ error: 'Description is required' })
        .min(10, 'Description must be at least 10 characters')
        .max(2000),
    type: z.enum(['villa', 'apartment', 'cottage', 'cabin', 'penthouse', 'beach-house'], {
        error: 'Property type is required',
    }),
    pricePerNight: z
        .number({ error: 'Price per night is required' })
        .min(0, 'Price cannot be negative'),
    cleaningFee: z.number().min(0).optional().default(0),
    serviceFee: z.number().min(0).optional().default(0),
    address: z.string({ error: 'Address is required' }).min(1),
    city: z.string({ error: 'City is required' }).min(1),
    state: z.string().optional().default(''),
    country: z.string({ error: 'Country is required' }).min(1),
    zipCode: z.string().optional().default(''),
    amenities: z.array(z.string()).optional().default([]),
    bedrooms: z.number({ error: 'Bedrooms is required' }).int().min(0),
    bathrooms: z.number({ error: 'Bathrooms is required' }).int().min(0),
    maxGuests: z.number({ error: 'Max guests is required' }).int().min(1),
    featured: z.boolean().optional().default(false),
    status: z.enum(['active', 'inactive', 'maintenance']).optional().default('active'),
    externalLinks: z
        .array(
            z.object({
                platformName: z.string().min(1),
                url: z.string().optional().default(''),
            })
        )
        .optional()
        .default([]),
});

// ─── Booking ──────────────────────────────────────
export const bookingSchema = z.object({
    checkIn: z.string({ error: 'Check-in date is required' }),
    checkOut: z.string({ error: 'Check-out date is required' }),
    adults: z.number({ error: 'Number of adults is required' }).int().min(1),
    children: z.number().int().min(0).optional().default(0),
    specialRequests: z.string().max(500).optional().default(''),
});

// ─── Enquiry ──────────────────────────────────────
export const enquirySchema = z.object({
    name: z.string({ error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ error: 'Email is required' }).email('Please provide a valid email'),
    phone: z.string().optional().default(''),
    property: z.string().optional(),
    subject: z.string().max(100).optional().default('General Enquiry'),
    message: z
        .string({ error: 'Message is required' })
        .min(5, 'Message must be at least 5 characters')
        .max(1000),
});

// ─── Type Exports ─────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
