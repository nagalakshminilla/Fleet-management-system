const express = require('express');
const router = express.Router();
const { createVehicle, assignDriver, getVehicle } = require('../controllers/vehicleController');
const vehicleRateLimiter = require('../middlewares/rateLimiter');

// Apply rate limiter only on create vehicle route
router.post('/add', vehicleRateLimiter, createVehicle);
router.patch('/assign-driver/:vehicleId', assignDriver);
router.get('/:vehicleId', getVehicle);

module.exports = router;