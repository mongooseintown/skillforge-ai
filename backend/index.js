const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/roadmaps', roadmapRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: '⚡ SkillForge AI Express API Server is Live' });
});

app.listen(PORT, () => {
  console.log(`⚡ SkillForge Express API Server running on port ${PORT}`);
});
