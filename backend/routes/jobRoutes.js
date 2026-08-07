/* ==========================================================================
   SKILLFORGE AI — JOBS ROUTES
   --------------------------------------------------------------------------
   GET /api/jobs        → List & filter jobs
   GET /api/jobs/:id    → Specific job item
   ========================================================================== */

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJobDetails);

module.exports = router;
