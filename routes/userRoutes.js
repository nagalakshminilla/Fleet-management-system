const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/userController');

// User signup route
router.post('/signup', signup);

module.exports = router;