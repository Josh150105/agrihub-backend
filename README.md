# 🌾 AgriHub TN - Production-Ready Backend

## 🎯 What's Been Fixed & Improved

### ✅ Security Enhancements
- ✔️ **Removed all hardcoded credentials**
- ✔️ **Strong JWT secret enforcement** (no fallback)
- ✔️ **Input validation** on all routes (express-validator)
- ✔️ **Rate limiting** to prevent brute force attacks
- ✔️ **CORS properly configured** (environment-based)
- ✔️ **Helmet.js** for security headers
- ✔️ **NoSQL injection prevention** (mongo-sanitize)
- ✔️ **XSS protection** (xss-clean)
- ✔️ **HTTP Parameter Pollution** prevention
- ✔️ **Request size limits** to prevent DoS
- ✔️ **Account lockout** after failed login attempts
- ✔️ **Token blacklist** for logout functionality

### ✅ Code Quality Improvements
- ✔️ **Custom error classes** for better error handling
- ✔️ **Winston logger** for structured logging
- ✔️ **Async error wrapper** for cleaner code
- ✔️ **Global error handler** middleware
- ✔️ **Input validation middleware**
- ✔️ **Enhanced Mongoose models** with validation
- ✔️ **Database indexes** for performance
- ✔️ **Graceful shutdown** handling

### ✅ Testing Infrastructure
- ✔️ **Jest configured** for unit & integration tests
- ✔️ **Test database setup**
- ✔️ **Test coverage reporting**
- ✔️ **Example test files** provided

### ✅ DevOps & Deployment
- ✔️ **Environment variable validation**
- ✔️ **.env.example** with all required vars
- ✔️ **ESLint & Prettier** configuration
- ✔️ **npm scripts** for common tasks
- ✔️ **Production-ready** server configuration

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
Node.js >= 18.0.0
MongoDB >= 6.0
npm >= 9.0.0
```

### 2. Installation

```bash
# Clone or copy the fixed backend
cd agrihub-fixed/backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your values
nano .env  # or use your favorite editor
```

### 3. Required Environment Variables

**CRITICAL:** Edit `.env` and set these:

```bash
# Generate strong JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env:
JWT_SECRET=<paste_generated_secret_here>
MONGO_URI=mongodb://localhost:27017/agrihub
OPENWEATHER_API_KEY=<your_api_key>
```

### 4. Create Admin User

```bash
# Method 1: Using environment variables
ADMIN_USERNAME=admin \
ADMIN_PASSWORD=YourStrongPassword123! \
npm run create-admin

# Method 2: Interactive prompt
npm run create-admin
```

### 5. Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📁 Project Structure

```
agrihub-backend/
├── config/              # Configuration files
│   └── db.js           # Database connection
├── controllers/         # Request handlers
│   ├── adminController.js
│   ├── farmerController.js
│   └── ...
├── middleware/          # Express middleware
│   ├── adminAuth.js    # Authentication
│   ├── validate.js     # Input validation
│   └── errorHandler.js # Error handling
├── models/              # Mongoose models
│   ├── Admin.js        # Enhanced with security
│   ├── Farmer.js       # Enhanced with validation
│   └── ...
├── routes/              # API routes
│   ├── adminRoutes.js
│   ├── farmerRoutes.js
│   └── ...
├── services/            # Business logic
│   ├── weatherService.js
│   ├── alertService.js
│   └── ...
├── utils/               # Utilities
│   ├── errors.js       # Custom error classes
│   ├── logger.js       # Winston logger
│   └── validator.js    # Validation helpers
├── tests/               # Test files
│   ├── setup.js        # Test configuration
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── logs/                # Log files (auto-created)
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── jest.config.js      # Jest configuration
├── package.json        # Dependencies
└── server.js           # Main entry point
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode (for development)
npm run test:watch

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm run test:coverage
```

### Writing Tests

Example test file (`tests/unit/farmer.test.js`):

```javascript
import Farmer from '../../models/Farmer.js';

describe('Farmer Model', () => {
  test('should create farmer with valid data', async () => {
    const farmerData = {
      name: 'Test Farmer',
      phone: '9876543210',
      district: 'Chennai'
    };
    
    const farmer = await Farmer.create(farmerData);
    
    expect(farmer.name).toBe('Test Farmer');
    expect(farmer.phone).toBe('9876543210');
    expect(farmer.language).toBe('ta'); // default
  });
  
  test('should reject invalid phone', async () => {
    const farmerData = {
      name: 'Test',
      phone: 'invalid'
    };
    
    await expect(Farmer.create(farmerData)).rejects.toThrow();
  });
});
```

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file
- ✅ Use strong random secrets
- ✅ Different secrets for dev/prod
- ✅ Rotate secrets regularly

### Passwords
- ✅ Minimum 8 characters
- ✅ Bcrypt with 12 rounds
- ✅ Account lockout after 5 failures
- ✅ 2-hour lockout period

### JWT Tokens
- ✅ 1-hour expiration
- ✅ Blacklist on logout
- ✅ Refresh token mechanism (recommended)

### Rate Limiting
- ✅ 100 requests per 15 min (general)
- ✅ 5 login attempts per 15 min
- ✅ Configurable via environment

---

## 📊 API Documentation

### Authentication

**POST** `/api/admin/login`
```json
{
  "username": "admin",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "admin": {
    "id": "...",
    "username": "admin",
    "role": "super_admin"
  }
}
```

### Farmers

**GET** `/api/farmers`
- Get all farmers

**GET** `/api/farmers/:phone`
- Get farmer by phone

**POST** `/api/farmers`
```json
{
  "name": "Farmer Name",
  "phone": "9876543210",
  "district": "Chennai",
  "block": "Ambattur",
  "lat": 13.0827,
  "lon": 80.2707
}
```

**PUT** `/api/farmers/:phone`
- Update farmer (requires auth)

**DELETE** `/api/farmers/:phone`
- Delete farmer (requires admin auth)

---

## 🐛 Debugging

### Enable Debug Logs

```bash
# In .env
LOG_LEVEL=debug

# Run with verbose logging
npm run dev
```

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**2. JWT_SECRET Missing**
```bash
# Error: JWT_SECRET is required
# Solution: Add to .env file
JWT_SECRET=your_generated_secret_here
```

**3. Port Already in Use**
```bash
# Change port in .env
PORT=5001
```

---

## 📈 Performance Optimization

### Database Indexes
All critical fields are indexed:
- Farmer: phone, district+block, lat+lon
- Admin: username, email

### Caching (Recommended)
Add Redis for caching:

```bash
npm install redis ioredis
```

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

---

## 🚀 Deployment

### Preparation Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use strong random JWT_SECRET
- [ ] Configure ALLOWED_ORIGINS
- [ ] Set up MongoDB with authentication
- [ ] Enable HTTPS
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring (PM2, Sentry)
- [ ] Configure log rotation
- [ ] Set up database backups
- [ ] Review and update rate limits

### Deploy with PM2

```bash
npm install -g pm2

# Start application
pm2 start server.js --name agrihub

# Start with cluster mode
pm2 start server.js -i max --name agrihub

# View logs
pm2 logs agrihub

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

---

## 📝 Changelog

### Version 2.0.0 (Production Ready)

**Security:**
- Removed hardcoded credentials
- Added comprehensive input validation
- Implemented rate limiting
- Added security headers with Helmet
- NoSQL injection prevention
- XSS protection
- Account lockout mechanism

**Code Quality:**
- Custom error classes
- Winston logging
- Global error handler
- Enhanced Mongoose models
- Database indexes

**Testing:**
- Jest configuration
- Test database setup
- Example test files

**DevOps:**
- Environment validation
- Graceful shutdown
- PM2 support
- Docker ready

---

## 🤝 Contributing

### Code Style

```bash
# Lint code
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

### Commit Messages
```
feat: Add new feature
fix: Bug fix
docs: Documentation
test: Add tests
refactor: Code refactoring
chore: Maintenance
```

---

## 📞 Support

### Questions?
- Check logs in `logs/` directory
- Review error messages carefully
- Ensure all environment variables are set
- Verify MongoDB is running

### Issues?
1. Check `.env` configuration
2. Review server logs
3. Test with `npm test`
4. Enable debug logging

---

## ✅ Next Steps

1. **Security**
   - [ ] Add refresh token mechanism
   - [ ] Implement 2FA for admins
   - [ ] Set up HTTPS certificates
   - [ ] Configure firewall rules

2. **Features**
   - [ ] SMS notification service
   - [ ] Email alerts
   - [ ] Push notifications
   - [ ] Admin dashboard improvements

3. **Performance**
   - [ ] Add Redis caching
   - [ ] Optimize database queries
   - [ ] Implement CDN for static assets
   - [ ] Load balancing

4. **Monitoring**
   - [ ] Set up Sentry for error tracking
   - [ ] Configure performance monitoring
   - [ ] Set up uptime monitoring
   - [ ] Create alerting rules

---

**Last Updated:** March 14, 2026  
**Version:** 2.0.0  
**Status:** Production Ready ✅
