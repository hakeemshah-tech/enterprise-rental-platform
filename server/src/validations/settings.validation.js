const { z } = require('zod');

const heroSlideSchema = z.object({
  imageUrl: z.string().optional().default(''),
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional().default(''),
});

const partnerSchema = z.object({
  name: z.string().min(1, 'Partner name is required'),
  logoUrl: z.string().optional().default(''),
  icon: z.string().optional().default(''),
});

const companyStatsSchema = z.object({
  yearsExperience: z.string().min(1, 'Years of experience is required'),
  propertiesManaged: z.string().min(1, 'Properties managed is required'),
  satisfiedClients: z.string().min(1, 'Satisfied clients is required'),
  guestRating: z.string().min(1, 'Guest rating is required'),
});

const companyInfoSchema = z.object({
  companyName: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
  workingHours: z.string().min(1, 'Working hours is required'),
});

const aboutContentSchema = z.object({
  philosophy: z.string().min(1, 'Philosophy is required'),
  coreServices: z
    .array(
      z.object({
        name: z.string().min(1, 'Service name is required'),
        icon: z.string().optional().default(''),
      })
    )
    .min(1, 'At least one service is required')
    .optional(),
  keyProjects: z.array(z.string()).optional().default([]),
});

/**
 * Partial update schema: every top-level field is optional so admins
 * can update a single section at a time via PATCH.
 */
const updateSettingsSchema = z
  .object({
    hero: z.array(heroSlideSchema).min(1, 'At least one hero slide is required').optional(),
    chairmansNote: z.string().min(1, "Chairman's note cannot be empty").optional(),
    companyStats: companyStatsSchema.optional(),
    partners: z.array(partnerSchema).optional(),
    companyInfo: companyInfoSchema.optional(),
    aboutContent: aboutContentSchema.optional(),
    googleMapsEmbedUrl: z.string().optional(),
    socialLinks: z
      .array(
        z.object({
          platform: z.string().min(1, 'Platform name is required'),
          url: z.string().optional().default(''),
          icon: z.string().optional().default(''),
        })
      )
      .optional(),
    bookingPlatforms: z
      .array(
        z.object({
          name: z.string().min(1, 'Platform name is required'),
          globalUrl: z.string().optional().default(''),
          icon: z.string().optional().default(''),
          logoUrl: z.string().optional().default(''),
          color: z.string().optional().default('#6366f1'),
          badge: z.string().optional().default(''),
          cta: z.string().optional().default(''),
        })
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one section must be provided for update',
  });

module.exports = { updateSettingsSchema };
