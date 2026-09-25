/**
 * Seed defaults for the GlobalSettings singleton.
 *
 * ⚠️  SANITIZED FOR PUBLIC RELEASE: every value here is a placeholder.
 *     These are first-boot defaults only: once an admin saves the
 *     Settings screen, the stored document wins and these are never
 *     read again. Both the Mongoose schema defaults and the legacy
 *     migration path in `settings.controller.js` import from here so
 *     there is exactly one place to re-brand.
 */

const DEFAULT_MAPS_EMBED_URL =
  'https://maps.google.com/maps?q=Dubai+International+Financial+Centre&t=&z=15&ie=UTF8&iwloc=&output=embed';

/**
 * Third-party distribution channels. The platform *names* are generic
 * integration labels; the URLs deliberately point at each platform's
 * home page rather than at any specific property listing.
 */
const DEFAULT_BOOKING_PLATFORMS = [
  {
    name: 'Airbnb',
    globalUrl: 'https://www.airbnb.com/',
    icon: '',
    logoUrl: '',
    color: '#FF5A5F',
    badge: 'Superhost',
    cta: 'View on Airbnb',
  },
  {
    name: 'Booking.com',
    globalUrl: 'https://www.booking.com/',
    icon: '',
    logoUrl: '',
    color: '#003580',
    badge: 'Verified Listing',
    cta: 'View on Booking.com',
  },
  {
    name: 'Agoda',
    globalUrl: 'https://www.agoda.com/',
    icon: '',
    logoUrl: '',
    color: '#5391F0',
    badge: 'Top Rated Host',
    cta: 'View on Agoda',
  },
];

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'Instagram', url: '', icon: 'Instagram' },
  { platform: 'Facebook', url: '', icon: 'Facebook' },
  { platform: 'Twitter', url: '', icon: 'Twitter' },
];

module.exports = {
  DEFAULT_MAPS_EMBED_URL,
  DEFAULT_BOOKING_PLATFORMS,
  DEFAULT_SOCIAL_LINKS,
};
