const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, default: 'My Anuradhapura 1-Day Visit Plan' },
  visitDate: { type: Date, default: Date.now },
  startTime: { type: String, default: '08:00' },
  pace: { type: String, enum: ['Relaxed', 'Balanced', 'Fast'], default: 'Balanced' },
  selectedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  routeOrder: [{
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    sequence: Number,
    arrivalTime: String,
    departureTime: String,
    visitDurationMinutes: Number,
    travelTimeFromPrevMinutes: Number,
    distanceFromPrevKm: Number
  }],
  totalDistanceKm: { type: Number, default: 0 },
  totalTravelTimeMinutes: { type: Number, default: 0 },
  expectedEndTime: { type: String },
  warnings: [{ type: String }],
  culturalTips: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);