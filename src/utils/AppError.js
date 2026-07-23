class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks "expected" errors (e.g. not found, bad input)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;