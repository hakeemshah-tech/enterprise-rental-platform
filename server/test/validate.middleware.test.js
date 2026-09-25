/**
 * Property API: validation middleware tests.
 *
 * `validate(schema)` is the single choke point between an inbound body
 * and a controller. It must do exactly two things: replace req.body with
 * the *parsed* (defaulted, transformed) value on success, and answer a
 * 400 with a field-addressable error list on failure, the shape the
 * client renders through `ApiResponse<T>.errors`.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');

const validate = require('../src/middleware/validate');

/** Minimal Express double: records the status/body the middleware sent. */
function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

/** Invoke the middleware and report what happened. */
function run(schema, body) {
  const req = { body };
  const res = createResponse();
  let nextCalled = false;

  validate(schema)(req, res, () => {
    nextCalled = true;
  });

  return { req, res, nextCalled };
}

const schema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
  nights: z.number().int().min(1).optional().default(1),
});

test('a valid body calls next() and leaves no response of its own', () => {
  const { res, nextCalled } = run(schema, { email: 'guest@example.com' });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
  assert.equal(res.body, null);
});

test('parsed defaults are written back onto req.body', () => {
  const { req } = run(schema, { email: 'guest@example.com' });

  assert.equal(req.body.nights, 1, 'controllers must see the defaulted value');
});

test('transforms survive the middleware boundary', () => {
  const trimming = z.object({ city: z.string().trim() });
  const { req, nextCalled } = run(trimming, { city: '  Springfield  ' });

  assert.equal(nextCalled, true);
  assert.equal(req.body.city, 'Springfield');
});

test('an invalid body short-circuits with 400 and never reaches the controller', () => {
  const { res, nextCalled } = run(schema, { email: 'nope' });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Validation failed');
});

test('errors are returned per field so the client can bind them to inputs', () => {
  const { res } = run(schema, { email: 'nope', nights: 0 });

  const byField = Object.fromEntries(res.body.errors.map((e) => [e.field, e.message]));

  assert.deepEqual(Object.keys(byField).sort(), ['email', 'nights']);
  assert.equal(byField.email, 'Please provide a valid email');
  assert.ok(byField.nights.length > 0);
});

test('nested field paths are flattened with dot notation', () => {
  const nested = z.object({
    location: z.object({ city: z.string({ required_error: 'City is required' }) }),
  });
  const { res } = run(nested, { location: {} });

  assert.equal(res.body.errors[0].field, 'location.city');
  assert.equal(res.body.errors[0].message, 'City is required');
});

test('a missing body is rejected rather than crashing the request', () => {
  const { res, nextCalled } = run(schema, undefined);

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
});
