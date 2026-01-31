const express = require('express');
const router = express.Router();
const { 
  createTrip, 
  getTrip, 
  updateTrip, 
  deleteTrip, 
  endTrip 
} = require('../controllers/tripController');

router.post('/create', createTrip);
router.patch('/update/:tripId', updateTrip);
router.get('/:tripId', getTrip);
router.delete('/delete/:tripId', deleteTrip);
router.patch('/end/:tripId', endTrip);

module.exports = router;