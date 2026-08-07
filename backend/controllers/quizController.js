/* ==========================================================================
   SKILLFORGE AI — QUIZ CONTROLLER
   --------------------------------------------------------------------------
   POST /api/quiz/generate   → returns a brand-new, never-before-seen question
                               set for a topic (answers stripped from payload)
   POST /api/quiz/submit     → grades the attempt and returns per-question
                               correctness + explanations

   TOKEN BUDGET: every quiz is exactly 5 questions and the avoid-list sent to
   the model is capped, so the free tier lasts as long as possible.
   ========================================================================== */

const crypto = require('crypto');
const db = require('../config/db');
const quizAI = require('../services/geminiQuizService');

/** Hard ceiling on questions per quiz — never generate more than this. */
const QUIZ_SIZE = 5;

/* --------------------------------------------------------------------------
   Schema bootstrap — creates the quiz tables on first use so the feature
   works without a manual migration step.
   -------------------------------------------------------------------------- */
let schemaReady = false;
async function ensureSchema() {
    if (schemaReady) return;
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_question_ledger (
        id BIGSERIAL PRIMARY KEY,
        question_hash CHAR(64) UNIQUE NOT NULL,
        topic VARCHAR(255) NOT NULL,
        question_text TEXT NOT NULL,
        user_key VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id BIGSERIAL PRIMARY KEY,
        user_key VARCHAR(255) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        questions_json JSONB NOT NULL,
        score INT,
        total INT,
        passed BOOLEAN,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);
        schemaReady = true;
    } catch (err) {
        console.warn('[Quiz] Schema bootstrap warning:', err.message);
    }
}

/* --------------------------------------------------------------------------
   In-memory fallback ledger — used when the database is unreachable so the
   no-repeat guarantee still holds for the lifetime of the server process.
   -------------------------------------------------------------------------- */
const memoryLedger = new Set();
const memoryAttempts = new Map(); // attemptId -> { questions, userKey, topic }

/** Global duplicate check across every user, ever. */
async function isHashTaken(hash) {
    if (memoryLedger.has(hash)) return true;
    try {
        const r = await db.query(
            'SELECT 1 FROM quiz_question_ledger WHERE question_hash = $1 LIMIT 1;',
            [hash]
        );
        return r.rowCount > 0;
    } catch (e) {
        return false;
    }
}

/** Persist accepted questions into the global ledger. */
async function recordQuestions(questions, topic, userKey) {
    for (const q of questions) {
        memoryLedger.add(q.hash);
    }
    try {
        for (const q of questions) {
            await db.query(
                `INSERT INTO quiz_question_ledger (question_hash, topic, question_text, user_key)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (question_hash) DO NOTHING;`,
                [q.hash, topic, q.question, userKey]
            );
        }
    } catch (e) {
        console.warn('[Quiz] Ledger write warning:', e.message);
    }
}

/** Fetch previously seen questions so the AI can avoid them.
 *  TOKEN BUDGET: kept small (12) because every avoided question is sent to
 *  the model as input tokens on each generation call. */
async function fetchAvoidList(userKey, topic, limit = 12) {
    try {
        const r = await db.query(
            `SELECT question_text FROM quiz_question_ledger
       WHERE topic = $1
       ORDER BY created_at DESC
       LIMIT $2;`,
            [topic, limit]
        );
        return r.rows.map(row => row.question_text);
    } catch (e) {
        return [];
    }
}

/* ==========================================================================
   POST /api/quiz/generate
   body: { topic, subtopics?, count?, userKey? }
   ========================================================================== */
const generateQuiz = async (req, res) => {
    try {
        const { topic, subtopics = [], count, userKey } = req.body || {};

        if (!topic || String(topic).trim() === '') {
            return res.status(400).json({ success: false, error: 'A topic is required to generate a quiz.' });
        }

        const cleanTopic = String(topic).trim();
        // TOKEN BUDGET: exactly 5 questions per quiz — hard ceiling, never more.
        const total = Math.min(Math.max(parseInt(count, 10) || QUIZ_SIZE, 1), QUIZ_SIZE);
        const who = userKey ? String(userKey) : 'anonymous';

        await ensureSchema();

        if (!quizAI.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI quiz generation is not configured. Add a valid GROQ_API_KEY (or GEMINI_API_KEY) to backend/.env and restart the server.'
            });
        }

        const avoidQuestions = await fetchAvoidList(who, cleanTopic);

        let questions;
        try {
            questions = await quizAI.generateUniqueQuestions({
                topic: cleanTopic,
                subtopics: Array.isArray(subtopics) ? subtopics : [],
                count: total,
                avoidQuestions,
                isHashTaken
            });
        } catch (aiErr) {
            console.error('[Quiz] AI generation failed:', aiErr.message);
            return res.status(502).json({
                success: false,
                error: 'The AI could not generate your quiz right now. Please try again in a moment.',
                detail: aiErr.message
            });
        }

        if (!questions || questions.length === 0) {
            return res.status(502).json({
                success: false,
                error: 'The AI returned no usable questions. Please try again.'
            });
        }

        // Lock these questions globally so they can never be issued again
        await recordQuestions(questions, cleanTopic, who);

        const attemptId = crypto.randomUUID();

        // Persist the attempt (with answers) server-side
        let dbAttemptId = null;
        try {
            const r = await db.query(
                `INSERT INTO quiz_attempts (user_key, topic, questions_json, total)
         VALUES ($1, $2, $3, $4) RETURNING id;`,
                [who, cleanTopic, JSON.stringify(questions), questions.length]
            );
            dbAttemptId = r.rows[0].id;
        } catch (e) {
            console.warn('[Quiz] Attempt persist warning:', e.message);
        }

        memoryAttempts.set(attemptId, {
            questions,
            userKey: who,
            topic: cleanTopic,
            dbAttemptId
        });

        // Strip answers before sending to the browser
        const clientQuestions = questions.map((q, i) => ({
            id: i,
            question: q.question,
            options: q.options
        }));

        return res.json({
            success: true,
            attemptId,
            topic: cleanTopic,
            total: clientQuestions.length,
            questions: clientQuestions
        });

    } catch (error) {
        console.error('[Quiz] generateQuiz error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while generating the quiz.' });
    }
};

/* ==========================================================================
   POST /api/quiz/submit
   body: { attemptId, answers: number[] }
   ========================================================================== */
const submitQuiz = async (req, res) => {
    try {
        const { attemptId, answers } = req.body || {};

        if (!attemptId || !memoryAttempts.has(attemptId)) {
            return res.status(400).json({ success: false, error: 'This quiz session has expired. Please start a new quiz.' });
        }
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, error: 'Answers must be provided as an array.' });
        }

        const attempt = memoryAttempts.get(attemptId);
        const { questions, userKey, topic, dbAttemptId } = attempt;

        let score = 0;
        const results = questions.map((q, i) => {
            const given = Number.isInteger(answers[i]) ? answers[i] : -1;
            const correct = given === q.correctIndex;
            if (correct) score++;
            return {
                id: i,
                question: q.question,
                options: q.options,
                selectedIndex: given,
                correctIndex: q.correctIndex,
                correct,
                explanation: q.explanation
            };
        });

        const total = questions.length;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 60;

        try {
            if (dbAttemptId) {
                await db.query(
                    `UPDATE quiz_attempts
           SET score = $1, total = $2, passed = $3, completed_at = CURRENT_TIMESTAMP
           WHERE id = $4;`,
                    [score, total, passed, dbAttemptId]
                );
            }
        } catch (e) {
            console.warn('[Quiz] Attempt update warning:', e.message);
        }

        // Session consumed
        memoryAttempts.delete(attemptId);

        return res.json({
            success: true,
            topic,
            score,
            total,
            percentage,
            passed,
            results
        });

    } catch (error) {
        console.error('[Quiz] submitQuiz error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while grading the quiz.' });
    }
};

module.exports = {
    generateQuiz,
    submitQuiz
};
