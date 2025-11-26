// routes/places.js
const express = require('express');
const router = express.Router();
const { 
  getPlaces,
  createPlace,
  updatePlaceById,
  deletePlaceById,
  getPlaceById
} = require('../services/placeService');
const { logChange, getAllHistory, getHistoryByPlace } = require('../services/changeLogService');

// GET /places?userId=...&name=...
router.get('/', async (req, res) => {
  try {
    const { userId, name } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (name) filter.name = new RegExp(name, 'i');

    const places = await getPlaces(filter);
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST crear lugar
router.post('/', async (req, res) => {
  try {
    const { name, description, userId, location } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId es requerido' });
    if (!location || !location.coordinates) {
      return res.status(400).json({ message: 'Coordenadas requeridas' });
    }

    const place = await createPlace({
      name,
      description,
      userId,
      location: {
        type: 'Point',
        coordinates: location.coordinates, // [lng, lat]
      },
    });

    await logChange(place._id, 'CREATE', {}, {
      name: place.name,
      description: place.description,
      location: place.location,
    });

    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// routes/places.js (debajo del POST y antes del PUT)

// GET /places/:id  (obtener un lugar por id)
router.get('/:id', async (req, res) => {
    try {
      const place = await getPlaceById(req.params.id);
      if (!place) {
        return res.status(404).json({ message: 'Lugar no encontrado' });
      }
      res.json(place);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
// PUT /places/:id  (editar)
router.put('/:id', async (req, res) => {
  try {
    const previous = await getPlaceById(req.params.id);
    if (!previous) {
      return res.status(404).json({ message: 'Lugar no encontrado' });
    }

    const data = { ...req.body };
    if (data.location && data.location.coordinates) {
      data.location.type = 'Point';
    }

    const updated = await updatePlaceById(req.params.id, data);

    await logChange(
      updated._id,
      'UPDATE',
      {
        name: previous.name,
        description: previous.description,
        location: previous.location,
      },
      {
        name: updated.name,
        description: updated.description,
        location: updated.location,
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /places/:id  (eliminar)
router.delete('/:id', async (req, res) => {
  try {
    const previous = await getPlaceById(req.params.id);
    if (!previous) {
      return res.status(404).json({ message: 'Lugar no encontrado' });
    }

    await deletePlaceById(req.params.id);

    await logChange(previous._id, 'DELETE', {
      name: previous.name,
      description: previous.description,
      location: previous.location,
    }, {});

    res.json({ message: 'Lugar eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Historial general (para history.html)
router.get('/history/all/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await getAllHistory(limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Historial por lugar (si lo necesitas)
router.get('/:id/history', async (req, res) => {
  try {
    const history = await getHistoryByPlace(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;