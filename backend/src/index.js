require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./shared/middlewares/error.middleware');

// Route imports
const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/user-management/routes/user.routes');
const serviceRoutes = require('./modules/laundry-service/routes/service.routes');
const bookingRoutes = require('./modules/booking/routes/booking.routes');
const transactionRoutes = require('./modules/transaction/routes/transaction.routes');
const reportRoutes = require('./modules/report/routes/report.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Rate limiting (global) — login endpoint akan punya limiter sendiri
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  message: { status: 'error', message: 'Terlalu banyak request, coba lagi dalam 15 menit.' },
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/reports', reportRoutes);

// Health check
app.get('/api/v1', (req, res) => {
  res.json({ status: 'success', message: 'Laundry System API v1', data: { version: '1.0.0' } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route tidak ditemukan.' });
});

// Global error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
