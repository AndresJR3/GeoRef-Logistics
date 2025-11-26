// services/placeService.js
const Place = require('../models/Place');

async function getPlaces(filter = {}) {
  return Place.find(filter);
}

async function createPlace(data) {
  return Place.create(data);
}

async function updatePlaceById(id, data) {
  return Place.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deletePlaceById(id) {
  return Place.findByIdAndDelete(id);
}

async function getPlaceById(id) {
  return Place.findById(id);
}

module.exports = {
  getPlaces,
  createPlace,
  updatePlaceById,
  deletePlaceById,
  getPlaceById,
};