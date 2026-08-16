const mongoose = require('mongoose');
const Place = require('../models/Place');
const { calculateHaversineDistance } = require('../utils/plannerHelper');

function parseJson(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function normalizePlacePayload(body, file) {
  const data = { ...body };
  data.coordinates = parseJson(data.coordinates, data.coordinates);
  data.facilities = parseJson(data.facilities, String(data.facilities || '').split(',').map((item) => item.trim()).filter(Boolean));
  if (data.coordinates) {
    data.coordinates = { lat: Number(data.coordinates.lat), lng: Number(data.coordinates.lng) };
    if (!Number.isFinite(data.coordinates.lat) || !Number.isFinite(data.coordinates.lng)) throw new Error('Valid latitude and longitude are required.');
  }
  if (data.visitDuration != null) data.visitDuration = Number(data.visitDuration);
  if (data.distanceFromHome != null && data.distanceFromHome !== '') data.distanceFromHome = Number(data.distanceFromHome);
  if (file) data.image = `/uploads/${file.filename}`;
  return data;
}

exports.getPlaces = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    if (req.query.search) {
      const search = String(req.query.search).slice(0, 80);
      query.$or = ['name', 'description', 'category'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
    }
    return res.json(await Place.find(query).sort({ distanceFromHome: 1, name: 1 }).lean());
  } catch (error) { return res.status(500).json({ message: 'Could not load destinations.' }); }
};

exports.getPlaceById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Place not found.' });
    const place = await Place.findOne({ _id: req.params.id, isActive: true }).lean();
    return place ? res.json(place) : res.status(404).json({ message: 'Place not found.' });
  } catch (error) { return res.status(500).json({ message: 'Could not load this destination.' }); }
};

exports.createPlace = async (req, res) => {
  try {
    const data = normalizePlacePayload(req.body, req.file);
    if (!Number.isFinite(data.distanceFromHome)) {
      data.distanceFromHome = calculateHaversineDistance(8.3448, 80.397, data.coordinates.lat, data.coordinates.lng);
    }
    return res.status(201).json(await Place.create(data));
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

exports.updatePlace = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Place not found.' });
    const place = await Place.findOne({ _id: req.params.id, isActive: true });
    if (!place) return res.status(404).json({ message: 'Place not found.' });
    Object.assign(place, normalizePlacePayload(req.body, req.file));
    return res.json(await place.save());
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

exports.deletePlace = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Place not found.' });
    const place = await Place.findOneAndUpdate({ _id: req.params.id, isActive: true }, { isActive: false }, { new: true });
    return place ? res.json({ message: 'Destination removed from the public guide.' }) : res.status(404).json({ message: 'Place not found.' });
  } catch (error) { return res.status(500).json({ message: 'Could not remove this destination.' }); }
};
