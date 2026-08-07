class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const response = {
    success: false,
    status: err.status,
    message: err.message || 'Internal Server Error'
  };

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  // For unknown programming errors, log them but hide details from client
  if (!err.isOperational && process.env.NODE_ENV !== 'development') {
    console.error('💥 FATAL ERROR:', err);
    response.message = 'Something went very wrong!';
  }

  res.status(err.statusCode).json(response);
};

module.exports = {
  AppError,
  notFoundHandler,
  globalErrorHandler
};
