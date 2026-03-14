/**
 * AgriHub Backend Server - Production Ready
 * Enhanced with security, logging, and error handling
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import cron from "node-cron";
import http from "http";
import { Server } from "socket.io";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Import routes
import farmerRoutes from "./routes/farmerRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import officeRoutes from "./routes/officeRoutes.js";
import farmerAuthRoutes from "./routes/farmerAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Import services
import { runWeatherAlerts } from "./services/alertService.js";

/* ================= VALIDATE ENVIRONMENT ================= */

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'OPENWEATHER_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  logger.error('Please check .env file and ensure all required variables are set');
  process.exit(1);
}

/* ================= APP INITIALIZATION ================= */

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { 
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    credentials: true
  }
});

io.on("connection", (socket) => {
  logger.info(`Socket client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    logger.info(`Socket client disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes
app.set('io', io);

/* ================= SECURITY MIDDLEWARE ================= */

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing with size limits
const maxRequestSize = process.env.MAX_REQUEST_SIZE || '10kb';
app.use(express.json({ limit: maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: maxRequestSize }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Special rate limiter for login routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

/* ================= REQUEST LOGGING ================= */

app.use((req, res, next) => {
  logger.logRequest(req);
  next();
});

/* ================= ROUTES ================= */

// Health check (no rate limit)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use("/api/schemes", schemeRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/recommend", recommendationRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/farmer-auth", farmerAuthRoutes);
app.use("/api/admin", loginLimiter, adminRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

/* ================= DATABASE CONNECTION ================= */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
    
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/* ================= CRON JOBS ================= */

const startCronJobs = () => {
  if (process.env.ENABLE_CRON_JOBS === 'false') {
    logger.info('Cron jobs disabled via environment variable');
    return;
  }
  
  logger.info("Cron jobs activated");
  
  // Daily market price fetch at 6 AM
  cron.schedule("0 6 * * *", () => {
    logger.info("Running daily market price fetch job");
    // Add market price fetch logic here
  });
  
  // Weather alerts every 3 hours
  cron.schedule("0 */3 * * *", () => {
    logger.info("Running weather alerts job");
    runWeatherAlerts();
  });
};

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start cron jobs
    startCronJobs();
    
    // Run initial weather alerts
    if (process.env.NODE_ENV !== 'test') {
      runWeatherAlerts();
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`AgriHub Server Started`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Port: ${PORT}`);
      logger.info(`========================================`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/* ================= GRACEFUL SHUTDOWN ================= */

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

/* ================= START ================= */

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
