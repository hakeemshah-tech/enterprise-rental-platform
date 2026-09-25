const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ---------- Global Middleware ----------

// Security headers: allow cross-origin image loading for uploaded files
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stripe webhook: MUST come before express.json() (needs raw body)
app.use('/api/webhooks', require('./routes/webhook.routes'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------- API Routes ----------
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/properties', require('./routes/property.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/enquiries', require('./routes/enquiry.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Property API is running 🚀' });
});

// ---------- Error Handler (must be last) ----------
app.use(errorHandler);

// ---------- Start Server ----------
// Only bind a port when this file is the entrypoint, so integration
// tests can `require('../src')` and drive the app without a listener.
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
