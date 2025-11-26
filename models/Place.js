// models/Place.js
const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  userId: {                      // <--- NUEVO
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],            // [lng, lat]
      required: true
    }
  }
}, { timestamps: true });

PlaceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', PlaceSchema);