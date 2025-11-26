// routes/polygons.js
const express = require('express');
const router = express.Router();
const Polygon = require('../models/Polygon');

// GET todos
router.get('/', async (req, res) => {
  const { userId } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;

  const polys = await Polygon.find(filter);
  res.json(polys);
});

// POST crear
router.post('/', async (req, res) => {
  try {
    const { name, description, coordinates, userId } = req.body;
    const poly = await Polygon.create({
      name,
      description,
      userId,
      area: {
        type: 'Polygon',
        coordinates // [[ [lng,lat], [lng,lat], ... ]]
      }
    });
    res.status(201).json(poly);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;