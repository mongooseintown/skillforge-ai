/* ==========================================================================
   SKILLFORGE AI — ELI5 CONTROLLER
   --------------------------------------------------------------------------
   POST /api/eli5/generate  → returns a full beginner lesson for one subtopic
   ========================================================================== */

const eli5AI = require('../services/eli5Service');

const generateLesson = async (req, res) => {
    try {
        const { subtopic, topic } = req.body || {};

        if (!subtopic || String(subtopic).trim() === '') {
            return res.status(400).json({ success: false, error: 'Pick a subtopic first.' });
        }

        if (!eli5AI.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI lesson generation is not configured. Add a valid GROQ_API_KEY to backend/.env and restart the server.'
            });
        }

        let lesson;
        try {
            lesson = await eli5AI.generateLesson({
                subtopic: String(subtopic),
                topic: topic ? String(topic) : ''
            });
        } catch (aiErr) {
            console.error('[ELI5] Lesson generation failed:', aiErr.message);
            return res.status(502).json({
                success: false,
                error: 'The AI could not write your lesson right now. Please try again in a moment.',
                detail: aiErr.message
            });
        }

        return res.json({
            success: true,
            subtopic: String(subtopic).trim(),
            topic: topic ? String(topic).trim() : '',
            lesson
        });

    } catch (error) {
        console.error('[ELI5] generateLesson error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while writing the lesson.' });
    }
};

module.exports = { generateLesson };
