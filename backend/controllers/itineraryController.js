const mongoose = require('mongoose');
const Itinerary = require('../models/Itinerary');
const Place = require('../models/Place');
const { generateSmartItinerary } = require('../utils/plannerHelper');

exports.createItinerary = async (req, res) => {
  try {
    const { placeIds, startTime = '08:00', pace = 'Balanced', title = 'My Anuradhapura DayTrail' } = req.body;
    if (!Array.isArray(placeIds) || placeIds.length === 0) return res.status(400).json({ message: 'Select at least one destination.' });
    if (placeIds.length > 6) return res.status(400).json({ message: 'A one-day route supports up to six destinations.' });
    if (!placeIds.every(mongoose.isValidObjectId)) return res.status(400).json({ message: 'One or more destination IDs are invalid.' });
    if (!['Relaxed', 'Balanced', 'Fast'].includes(pace)) return res.status(400).json({ message: 'Choose a valid travel pace.' });
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return res.status(400).json({ message: 'Choose a valid start time.' });

    const places = await Place.find({ _id: { $in: placeIds }, isActive: true });
    if (places.length !== new Set(placeIds).size) return res.status(404).json({ message: 'One or more selected destinations are unavailable.' });
    const result = generateSmartItinerary(places, startTime, pace);

    const itinerary = await Itinerary.create({
      userId: req.user?._id || null,
      title: String(title).trim().slice(0, 80) || 'My Anuradhapura DayTrail',
      startTime,
      pace,
      selectedPlaces: placeIds,
      routeOrder: result.routeOrder.map((step) => ({
        place: step.place._id,
        sequence: step.sequence,
        arrivalTime: step.arrivalTime,
        departureTime: step.departureTime,
        visitDurationMinutes: step.visitDurationMinutes,
        travelTimeFromPrevMinutes: step.travelTimeFromPrevMinutes,
        distanceFromPrevKm: step.distanceFromPrevKm,
      })),
      totalDistanceKm: result.totalDistanceKm,
      totalTravelTimeMinutes: result.totalTravelTimeMinutes,
      expectedEndTime: result.expectedEndTime,
      warnings: result.warnings,
      culturalTips: result.culturalTips,
    });
    return res.status(201).json(await Itinerary.findById(itinerary._id).populate('routeOrder.place'));
  } catch (error) { return res.status(500).json({ message: error.message || 'Could not create the itinerary.' }); }
};

exports.getItineraries = async (req, res) => {
  try {
    return res.json(await Itinerary.find({ userId: req.user._id }).populate('routeOrder.place').sort({ createdAt: -1 }));
  } catch (error) { return res.status(500).json({ message: 'Could not load itineraries.' }); }
};

exports.getItineraryById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Itinerary not found.' });
    const itinerary = await Itinerary.findById(req.params.id).populate('routeOrder.place');
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found.' });
    const ownsItinerary = String(itinerary.userId) === String(req.user._id);
    if (!ownsItinerary && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot view this itinerary.' });
    return res.json(itinerary);
  } catch (error) { return res.status(500).json({ message: 'Could not load this itinerary.' }); }
};

