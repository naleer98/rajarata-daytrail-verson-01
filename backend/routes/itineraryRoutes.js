const express = require('express');
const router = express.Router();
const { createItinerary, getItineraries, getItineraryById } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createItinerary);
router.get('/', protect, getItineraries);
router.get('/:id', protect, getItineraryById);

module.exports = router;
