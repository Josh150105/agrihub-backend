/**
 * Winston Logger Configuration
 * Structured logging for production monitoring
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if exists
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'agrihub-backend' },
  transports: [
    // Console output (colorized for development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    
    // File output - all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File output - errors only
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Don't log to file in test environment
if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach(transport => {
    if (transport instanceof winston.transports.File) {
      transport.silent = true;
    }
  });
}

// Helper methods
logger.logRequest = (req) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

logger.logError = (err, req) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req?.url,
    method: req?.method,
    ip: req?.ip,
    statusCode: err.statusCode
  });
};

export default logger;
