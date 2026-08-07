const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const roadmapRoutes = require('./routes/roadmapRoutes');
const certRoutes = require('./routes/certRoutes');
const quizRoutes = require('./routes/quizRoutes');
const eli5Routes = require('./routes/eli5Routes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/eli5', eli5Routes);
app.use('/api/jobs', jobRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: '⚡ SkillForge AI Express API Server is Live' });
});

// Import Error Handlers
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Catch 404 and forward to error handler
app.use('*', notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ SkillForge Express API Server running on port ${PORT}`);
  });
}

module.exports = app;
