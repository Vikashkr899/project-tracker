const { validationResult } = require('express-validator');

// Runs after express-validator check(...) middlewares; short-circuits with a
// 400 and field-level messages if any check failed.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'ValidationError', message: 'Invalid input', details: errors.array() });
  }
  next();
}

module.exports = validate;
