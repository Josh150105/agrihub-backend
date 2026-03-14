/**
 * Global Error Handling Middleware
 * Catches and formats all errors consistently
 */

import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Development error response (detailed)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Production error response (sanitized)
 */
const sendErrorProd = (err, res) => {
  // Operational error - send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  } 
  // Programming or unknown error - don't leak details
  else {
    logger.error('UNKNOWN ERROR', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

/**
 * Handle specific Mongoose errors
 */
const handleMongooseError = (err) => {
  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    return new AppError(`${field} '${value}' already exists`, 409);
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return new AppError('Validation failed', 400, errors);
  }
  
  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  
  return err;
};

/**
 * Main error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error
  logger.logError(err, req);
  
  // Handle Mongoose-specific errors
  if (err.name === 'MongoError' || err.name === 'ValidationError' || err.name === 'CastError') {
    err = handleMongooseError(err);
  }
  
  // Send response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

/**
 * 404 handler for undefined routes
 */
export const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
