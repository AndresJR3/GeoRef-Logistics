// models/Polygon.js
const mongoose = require('mongoose');

const PolygonSchema = new mongoose.Schema({
  name: String,
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  area: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      // [[ [lng, lat], [lng, lat], ... ]]
      type: [[[Number]]],
      required: true
    }
  }
}, { timestamps: true });

PolygonSchema.index({ area: '2dsphere' });

module.exports = mongoose.model('Polygon', PolygonSchema);