/**
 * Property API: request-contract tests.
 *
 * These exercise the Zod schemas that every mutating route runs before a
 * controller is reached, i.e. the exact boundary the Next.js client codes
 * against (`client/src/types/index.ts`). They need no database and no
 * network, so they run identically on a laptop and in CI.
 *
 * Run: npm test -w @rental/server
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
} = require('../src/validations/auth.validation');
const {
  createPropertySchema,
  updatePropertySchema,
} = require('../src/validations/property.validation');
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require('../src/validations/booking.validation');

/** Field paths that failed validation, e.g. ['location.city']. */
const failedPaths = (result) => result.error.issues.map((issue) => issue.path.join('.'));

// ──────────────────────────────────────────────────────────────
// POST /api/auth/register  &  /login  &  /verify-otp
// ──────────────────────────────────────────────────────────────

test('register accepts a well-formed payload and leaves phone optional', () => {
  const parsed = registerSchema.parse({
    name: 'Test User',
    email: 'test.user@example.com',
    password: 'correct-horse',
  });

  assert.equal(parsed.email, 'test.user@example.com');
  assert.equal(parsed.phone, undefined);
});

test('register rejects a malformed email and a short password', () => {
  const result = registerSchema.safeParse({
    name: 'Test User',
    email: 'not-an-email',
    password: 'short',
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result).sort(), ['email', 'password']);
});

test('register trims surrounding whitespace from the display name', () => {
  const parsed = registerSchema.parse({
    name: '  Test User  ',
    email: 'test.user@example.com',
    password: 'correct-horse',
  });

  assert.equal(parsed.name, 'Test User');
});

test('login requires both credentials', () => {
  const result = loginSchema.safeParse({ email: 'test.user@example.com' });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['password']);
});

test('verify-otp only accepts exactly six digits', () => {
  const valid = verifyOtpSchema.safeParse({
    email: 'admin@example.com',
    otp: '123456',
  });
  assert.equal(valid.success, true);

  // A wrong-length, non-numeric code trips both rules, so assert on the
  // field rather than on the issue count.
  for (const otp of ['12345', '1234567', 'abcdef', '12 456']) {
    const result = verifyOtpSchema.safeParse({ email: 'admin@example.com', otp });
    assert.equal(result.success, false, `expected "${otp}" to be rejected`);

    const paths = failedPaths(result);
    assert.ok(paths.length > 0);
    assert.ok(
      paths.every((path) => path === 'otp'),
      `expected every issue on "otp", got ${paths.join(', ')}`
    );
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/properties  &  PUT /api/properties/:id
// ──────────────────────────────────────────────────────────────

/** Minimal valid listing, mirroring the `Property` interface. */
const validProperty = () => ({
  title: 'Sunset Villa',
  description: 'A spacious three-bedroom villa with a private pool and sea views.',
  type: 'villa',
  price: { perNight: 450 },
  location: {
    address: '1 Example Street',
    city: 'Springfield',
    country: 'Testland',
  },
  capacity: { bedrooms: 3, bathrooms: 2, maxGuests: 6 },
});

test('create property flattens the nested capacity object for Mongoose', () => {
  const parsed = createPropertySchema.parse(validProperty());

  assert.equal(parsed.bedrooms, 3);
  assert.equal(parsed.bathrooms, 2);
  assert.equal(parsed.maxGuests, 6);
  assert.equal(parsed.capacity, undefined, 'capacity must not reach the model');
});

test('create property applies documented defaults', () => {
  const parsed = createPropertySchema.parse(validProperty());

  assert.equal(parsed.price.cleaningFee, 0);
  assert.equal(parsed.price.serviceFee, 0);
  assert.equal(parsed.status, 'active');
  assert.equal(parsed.featured, false);
  assert.deepEqual(parsed.amenities, []);
  assert.deepEqual(parsed.images, []);
  assert.deepEqual(parsed.externalLinks, []);
});

test('create property accepts flat capacity fields as well as the nested object', () => {
  const { capacity, ...flat } = validProperty();
  const parsed = createPropertySchema.parse({
    ...flat,
    bedrooms: capacity.bedrooms,
    bathrooms: capacity.bathrooms,
    maxGuests: capacity.maxGuests,
  });

  assert.equal(parsed.maxGuests, 6);
});

test('create property rejects a listing with no occupancy at all', () => {
  const { capacity, ...noCapacity } = validProperty();
  const result = createPropertySchema.safeParse(noCapacity);

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result).sort(), ['bathrooms', 'bedrooms', 'maxGuests']);
});

test('create property rejects an unsupported property type', () => {
  const result = createPropertySchema.safeParse({ ...validProperty(), type: 'castle' });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['type']);
});

test('create property rejects an amenity outside the enum', () => {
  const result = createPropertySchema.safeParse({
    ...validProperty(),
    amenities: ['wifi', 'helipad'],
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['amenities.1']);
});

test('create property requires a complete location', () => {
  const result = createPropertySchema.safeParse({
    ...validProperty(),
    location: { address: '1 Example Street' },
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result).sort(), ['location.city', 'location.country']);
});

test('create property rejects a negative nightly rate', () => {
  const result = createPropertySchema.safeParse({
    ...validProperty(),
    price: { perNight: -1 },
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['price.perNight']);
});

test('update property is a true partial: an empty patch is valid', () => {
  const parsed = updatePropertySchema.parse({});
  assert.deepEqual(parsed, {});
});

test('update property still flattens capacity and still validates enums', () => {
  const parsed = updatePropertySchema.parse({
    capacity: { bedrooms: 1, bathrooms: 1, maxGuests: 2 },
  });
  assert.equal(parsed.bedrooms, 1);

  const result = updatePropertySchema.safeParse({ status: 'archived' });
  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['status']);
});

// ──────────────────────────────────────────────────────────────
// POST /api/bookings  &  PATCH /api/bookings/:id/status
// ──────────────────────────────────────────────────────────────

const validBooking = () => ({
  property: '65f0a1b2c3d4e5f6a7b8c9d0',
  checkIn: '2026-01-10',
  checkOut: '2026-01-14',
  guests: { adults: 2 },
});

test('create booking defaults children to zero and special requests to empty', () => {
  const parsed = createBookingSchema.parse(validBooking());

  assert.equal(parsed.guests.children, 0);
  assert.equal(parsed.specialRequests, '');
});

test('create booking requires at least one adult', () => {
  const result = createBookingSchema.safeParse({
    ...validBooking(),
    guests: { adults: 0 },
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['guests.adults']);
});

test('create booking caps special requests at 500 characters', () => {
  const result = createBookingSchema.safeParse({
    ...validBooking(),
    specialRequests: 'x'.repeat(501),
  });

  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['specialRequests']);
});

test('booking status transitions are restricted to the known lifecycle', () => {
  for (const status of ['pending', 'confirmed', 'cancelled', 'completed']) {
    assert.equal(updateBookingStatusSchema.safeParse({ status }).success, true);
  }

  const result = updateBookingStatusSchema.safeParse({ status: 'refunded' });
  assert.equal(result.success, false);
  assert.deepEqual(failedPaths(result), ['status']);
});

test('payment status is optional but constrained when present', () => {
  assert.equal(
    updateBookingStatusSchema.safeParse({ status: 'confirmed', paymentStatus: 'paid' }).success,
    true
  );
  assert.equal(
    updateBookingStatusSchema.safeParse({ status: 'confirmed', paymentStatus: 'settled' }).success,
    false
  );
});
