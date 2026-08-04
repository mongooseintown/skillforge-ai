const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');

// Feature #1 Endpoint: POST /api/roadmaps/generate
router.post('/generate', generateRoadmap);

module.exports = router;
