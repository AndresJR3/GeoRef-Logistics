const express = require('express');
const router = express.Router();
const ChangeLog = require('../models/ChangeLog');

router.get('/history/all', async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const history = await ChangeLog.find().sort({ timestamp: -1 }).limit(limit);
    res.json(history);
});

router.get('/:id/history', async (req, res) => {
    const history = await ChangeLog.find({ placeId: req.params.id }).sort({ timestamp: -1 });
    res.json(history);
});

module.exports = router;