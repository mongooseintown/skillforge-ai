/* ==========================================================================
   SKILLFORGE AI — ELI5 ROUTES
   --------------------------------------------------------------------------
   POST /api/eli5/generate  → beginner lesson for a single subtopic
   ========================================================================== */

const express = require('express');
const router = express.Router();
const eli5Controller = require('../controllers/eli5Controller');

router.post('/generate', eli5Controller.generateLesson);

module.exports = router;
