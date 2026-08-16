const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  category: {
    type: String,
    required: true,
    enum: [
      'Religious',
      'Heritage',
      'Nature',
      'Cultural',
      'Museum',
      'Recreational',
      'Restaurant',
      'Public Place'
    ]
  },

  description: {
    type: String,
    required: true
  },

  tagline: {
    type: String,
    default: ''
  },

  address: {
    type: String,
    default: 'Anuradhapura, Sri Lanka'
  },

  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  openingTime: {
    type: String,
    required: true
  },

  closingTime: {
    type: String,
    required: true
  },

  visitDuration: {
    type: Number,
    required: true
  },

  entryFee: {
    type: String,
    default: 'Free'
  },

  contactNumber: {
    type: String,
    default: 'N/A'
  },

  image: {
    type: String,
    default: ''
  },

  images: [{
    type: String
  }],

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.8
  },

  travelTips: {
    type: String
  },

  dressCode: {
    type: String,
    default: 'Modest attire recommended'
  },

  facilities: [{
    type: String
  }],

  bestVisitTime: {
    type: String,
    default: 'Morning or Late Afternoon'
  },

  distanceFromHome: {
    type: Number,
    min: 0,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Place', placeSchema);
