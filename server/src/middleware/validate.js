/**
 * Generic Zod validation middleware.
 * Usage: router.post('/', validate(schema), controller)
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Assign transformed result back to req.body so transforms take effect
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors?.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
};

module.exports = validate;
