const mongoose = require('mongoose');
const slugify = require('slugify');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please select a property type'],
      enum: ['villa', 'apartment', 'cottage', 'cabin', 'penthouse', 'beach-house'],
    },
    price: {
      perNight: {
        type: Number,
        required: [true, 'Please add a price per night'],
        min: [0, 'Price cannot be negative'],
      },
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
    },
    location: {
      address: { type: String, required: [true, 'Please add an address'] },
      city: { type: String, required: [true, 'Please add a city'] },
      state: { type: String, default: '' },
      country: { type: String, required: [true, 'Please add a country'] },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    amenities: [
      {
        type: String,
        enum: [
          'wifi',
          'pool',
          'parking',
          'kitchen',
          'air-conditioning',
          'heating',
          'washer',
          'dryer',
          'tv',
          'gym',
          'hot-tub',
          'fireplace',
          'balcony',
          'garden',
          'bbq',
          'pet-friendly',
          'beach-access',
          'ski-access',
          'ev-charger',
          'security',
        ],
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    maxGuests: { type: Number, required: true, min: 1 },
    blockedDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, default: 'maintenance' },
      },
    ],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    // External booking platform links (dynamic: adapts to CMS platforms)
    externalLinks: [
      {
        platformName: { type: String, required: true },
        url: { type: String, default: '' },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Create slug from title
propertySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Index for search
propertySchema.index({ 'location.city': 1, type: 1, 'price.perNight': 1 });
propertySchema.index({ slug: 1 });
propertySchema.index({ featured: 1 });

module.exports = mongoose.model('Property', propertySchema);
