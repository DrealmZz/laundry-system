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
const pemesananRoutes = require('./modules/pemesanan/routes/pemesanan.routes');
const transaksiRoutes = require('./modules/transaction/routes/transaksi.routes');
const reportRoutes = require('./modules/report/routes/report.routes');
const machineRoutes = require('./modules/machine/routes/machine.routes');
const shiftRoutes = require('./modules/shift/routes/shift.routes');
const notificationRoutes = require('./modules/notification/routes/notification.routes');
const auditRoutes = require('./modules/audit/routes/audit.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());
// CORS configuration - izinkan multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Parse allowed origins dari environment variable
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001')
      .split(',')
      .map(o => o.trim());
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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
app.use('/api/v1/pemesanan', pemesananRoutes);
app.use('/api/v1/transaksi', transaksiRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/mesin', machineRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/audit', auditRoutes);

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
