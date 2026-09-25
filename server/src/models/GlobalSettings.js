const mongoose = require('mongoose');
const {
  DEFAULT_MAPS_EMBED_URL,
  DEFAULT_BOOKING_PLATFORMS,
  DEFAULT_SOCIAL_LINKS,
} = require('../config/defaults');

/**
 * GlobalSettings: Singleton document for website content management.
 * Only one document exists; it is upserted on first access.
 */
const heroSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: '' },
    heading: { type: String, required: true },
    subheading: { type: String, default: '' },
  },
  { _id: true }
);

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
  { _id: true }
);

const auditEntrySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String, required: true },
    section: { type: String, required: true },
    action: { type: String, default: 'updated' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const globalSettingsSchema = new mongoose.Schema(
  {
    // Singleton key: always "global"
    key: { type: String, default: 'global', unique: true },

    // Hero Section
    hero: {
      type: [heroSlideSchema],
      default: [
        {
          imageUrl: '',
          heading: 'Discover Your Perfect Getaway',
          subheading:
            'Your comfort is our priority, ensuring a seamless and pleasant experience at every step.',
        },
      ],
    },

    // Chairman's Note
    chairmansNote: {
      type: String,
      default:
        'For nearly two decades our team has worked across the residential and short-stay rental market. What began as a commitment to exceptional property services has evolved into a single vision: to be the most trusted rental operator in every market we serve.',
    },

    // Company Stats
    companyStats: {
      yearsExperience: { type: String, default: '20+' },
      propertiesManaged: { type: String, default: '100+' },
      satisfiedClients: { type: String, default: '50+' },
      guestRating: { type: String, default: '4.8' },
    },

    // Partners
    partners: {
      type: [partnerSchema],
      default: [
        { name: 'Alpha Holdings', logoUrl: '' },
        { name: 'Beta Partners', logoUrl: '' },
        { name: 'Gamma Real Estate', logoUrl: '' },
        { name: 'Delta Ventures', logoUrl: '' },
      ],
    },

    // Company Contact Info
    companyInfo: {
      companyName: { type: String, default: 'Enterprise Rental Platform' },
      tagline: { type: String, default: 'Vacation Homes Rental' },
      phone: { type: String, default: '+971 4 390 1234' },
      email: { type: String, default: 'contact@apexproperty.ae' },
      address: {
        type: String,
        default:
          'Apex Tower, Financial District, Level 34, Office 3405, Dubai, United Arab Emirates',
      },
      workingHours: { type: String, default: 'Mon – Fri: 9:00 AM – 6:00 PM' },
    },

    // Google Maps Embed URL (top-level for reliable CRUD)
    googleMapsEmbedUrl: {
      type: String,
      default: DEFAULT_MAPS_EMBED_URL,
    },

    // About Content
    aboutContent: {
      philosophy: {
        type: String,
        default:
          'Your comfort is our priority, ensuring a seamless and pleasant experience at every step.',
      },
      coreServices: {
        type: [
          {
            name: { type: String, required: true },
            icon: { type: String, default: '' },
          },
        ],
        default: [
          { name: 'Residential Sales', icon: 'Building2' },
          { name: 'Commercial Leasing', icon: 'TrendingUp' },
          { name: 'Property Management', icon: 'MapPin' },
          { name: 'Vacation Home Rentals', icon: 'Lightbulb' },
          { name: 'Investment Advisory', icon: 'Target' },
        ],
      },
      keyProjects: {
        type: [String],
        default: ['The Marina Residences', 'Skyline Towers'],
      },
    },

    // Social Media Links
    socialLinks: {
      type: [
        {
          platform: { type: String, required: true },
          url: { type: String, default: '' },
          icon: { type: String, default: '' },
        },
      ],
      default: DEFAULT_SOCIAL_LINKS,
    },

    // Booking Platforms (e.g. Airbnb, Booking.com, Agoda)
    bookingPlatforms: {
      type: [
        {
          name: { type: String, required: true },
          globalUrl: { type: String, default: '' },
          icon: { type: String, default: '' },
          logoUrl: { type: String, default: '' },
          color: { type: String, default: '#6366f1' },
          badge: { type: String, default: '' },
          cta: { type: String, default: '' },
        },
      ],
      default: DEFAULT_BOOKING_PLATFORMS,
    },

    // Audit Log, capped at 50 entries
    auditLog: {
      type: [auditEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
