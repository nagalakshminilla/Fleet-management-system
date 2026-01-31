const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middlewares
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tripRoutes = require('./routes/tripRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger); // Logger middleware for all routes

// Simple authentication middleware (for demo purposes)
app.use((req, res, next) => {
  // For demo, we'll use a simple user ID from header
  // In production, use proper JWT authentication
  req.userId = req.headers['user-id'] || 'demo-user-id';
  next();
});

// Routes
app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/trips', tripRoutes);
app.use('/analytics', analyticsRoutes);

// 404 handler for undefined routes
app.use(notFound);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
});