// Central error handler. Any thrown error (or next(err)) lands here so every
// endpoint returns a consistent JSON error shape instead of leaking stack traces.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: err.errors ? err.errors.map((e) => e.message).join('; ') : err.message,
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.name || 'Error', message: err.message, ...(err.extra || {}) });
  }

  return res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
}

class ApiError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

module.exports = { errorHandler, ApiError };
