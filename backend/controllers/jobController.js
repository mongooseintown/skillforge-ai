/* ==========================================================================
   SKILLFORGE AI — JOBS CONTROLLER
   --------------------------------------------------------------------------
   GET /api/jobs        → Filtered Bangladesh Tech jobs with track sync
   GET /api/jobs/:id    → Specific job item details
   ========================================================================== */

const jobService = require('../services/jobService');

const listJobs = (req, res) => {
    try {
        const { track, experience, workType, search, skills, sort } = req.query;

        let parsedSkills = [];
        if (skills) {
            parsedSkills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const data = jobService.getJobs({
            track,
            experience,
            workType,
            search,
            skills: parsedSkills,
            sort
        });

        return res.json({
            success: true,
            totalFound: data.totalFound,
            newToday: data.newToday,
            track: data.track,
            jobs: data.jobs
        });
    } catch (error) {
        console.error('[JOBS] listJobs error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while loading jobs.' });
    }
};

const getJobDetails = (req, res) => {
    try {
        const { id } = req.params;
        const job = jobService.getJobById(id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found.' });
        }
        return res.json({ success: true, job });
    } catch (error) {
        console.error('[JOBS] getJobDetails error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};

module.exports = {
    listJobs,
    getJobDetails
};
