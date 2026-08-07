const express = require('express');
const router = express.Router();
const { generateQuiz, submitQuiz } = require('../controllers/quizController');

// Generate a brand-new AI quiz for a roadmap topic
router.post('/generate', generateQuiz);

// Grade a completed quiz attempt
router.post('/submit', submitQuiz);

module.exports = router;
