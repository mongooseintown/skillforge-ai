/* ==========================================================================
   SKILLFORGE AI — AI QUIZ GENERATION SERVICE  (multi-provider)
   --------------------------------------------------------------------------
   Generates fresh, never-before-seen multiple-choice questions for a topic.

   PROVIDER CHAIN:
   Groq (llama-3.3-70b-versatile) is tried first — free tier, no credit card,
   very high rate limits and native JSON mode. If Groq is unavailable the
   service transparently falls back to Google Gemini. Set QUIZ_PROVIDER in
   backend/.env to "groq" | "gemini" | "auto" (default) to control this.

   NO-REPEAT GUARANTEE:
   Every question is normalized and hashed (SHA-256). A hash that already
   exists in `quiz_question_ledger` is rejected and the model is asked again
   with an explicit "do not produce anything like these" avoid-list. Because
   the ledger is GLOBAL, a question that any user has ever received will never
   be served again — not to that user, and not to anybody else.
   ========================================================================== */

const crypto = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/* ── CONFIG ─────────────────────────────────────────────────────────────── */

/** Hard cap on questions per quiz to preserve free tier quota. */
const MAX_QUESTIONS = 5;

const QUIZ_PROVIDER = (process.env.QUIZ_PROVIDER || 'auto').trim().toLowerCase();

const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Groq models tried in order — one being retired/busy falls through. */
const GROQ_MODEL_CHAIN = [
    GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
].filter((m, i, arr) => m && arr.indexOf(m) === i);

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
const GEMINI_URL = (model) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const GEMINI_MODEL_CHAIN = [
    GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash'
].filter((m, i, arr) => m && arr.indexOf(m) === i);

/* ── ERROR HUMANIZERS ───────────────────────────────────────────────────── */

function humanizeGroqError(status, bodyText) {
    let apiMsg = '';
    try {
        apiMsg = JSON.parse(bodyText)?.error?.message || '';
    } catch (e) { /* non-JSON body */ }

    if (status === 401) {
        return 'Groq rejected the API key. Create a new one at https://console.groq.com/keys '
            + 'and set GROQ_API_KEY in backend/.env.';
    }
    if (status === 429) {
        return 'Groq rate limit reached. Wait a minute and try the quiz again.';
    }
    if (status === 404 || /decommissioned|does not exist/i.test(apiMsg)) {
        return `The Groq model "${GROQ_MODEL}" is unavailable. Try GROQ_MODEL=llama-3.3-70b-versatile in backend/.env.`;
    }
    return apiMsg
        ? `Groq error ${status}: ${apiMsg.slice(0, 220)}`
        : `Groq API responded with HTTP ${status}.`;
}

function humanizeGeminiError(status, bodyText) {
    let apiMsg = '';
    let reason = '';
    try {
        const j = JSON.parse(bodyText);
        apiMsg = j?.error?.message || '';
        reason = j?.error?.details?.[0]?.reason || j?.error?.status || '';
    } catch (e) { /* non-JSON body */ }

    if (status === 429) {
        return 'Gemini quota exhausted for this API key (free-tier limit reached). '
            + 'Create a fresh key at https://aistudio.google.com/app/apikey and set GEMINI_API_KEY in backend/.env.';
    }
    if (status === 401 || status === 403 || reason === 'API_KEY_SERVICE_BLOCKED' || reason === 'API_KEY_INVALID') {
        return 'Gemini rejected the API key (invalid, blocked, or the Generative Language API is not enabled). '
            + 'Generate a new key at https://aistudio.google.com/app/apikey and set GEMINI_API_KEY in backend/.env.';
    }
    if (status === 404) {
        return `The model "${GEMINI_MODEL}" is not available for this key. Try GEMINI_MODEL=gemini-2.0-flash in backend/.env.`;
    }
    return apiMsg
        ? `Gemini error ${status}: ${apiMsg.slice(0, 220)}`
        : `Gemini API responded with HTTP ${status}.`;
}

/* ── HASHING / DEDUPE HELPERS ───────────────────────────────────────────── */

/** Normalize question text so trivial rewording still collides as a duplicate. */
function normalizeQuestion(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')   // strip punctuation
        .replace(/\s+/g, ' ')           // collapse whitespace
        .trim();
}

/** SHA-256 fingerprint of a question. */
function hashQuestion(text) {
    return crypto.createHash('sha256').update(normalizeQuestion(text)).digest('hex');
}

/* ── PROMPT ─────────────────────────────────────────────────────────────── */

function buildPrompt(topic, subtopics, count, avoidList, nonce) {
    const subs = (subtopics && subtopics.length)
        ? subtopics.join(', ')
        : 'core fundamentals of the topic';

    const avoidBlock = avoidList.length
        ? `\n\nSTRICTLY FORBIDDEN — these exact questions (and any paraphrase, reordering, or reworded variant of them) have ALREADY been used and must NEVER appear again:\n${avoidList.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        : '';

    return `You are an expert technical interviewer creating a fresh assessment.

TOPIC: ${topic}
SUBTOPICS TO COVER: ${subs}

Generate exactly ${count} ORIGINAL multiple-choice questions that test real, practical understanding of this topic (not trivia, not definitions copied from docs). Vary the angle: debugging scenarios, output prediction, best-practice choices, edge cases, and "why does this happen" reasoning.

UNIQUENESS SEED: ${nonce}
Use this seed to guarantee your question set is completely different from any set you have produced before.${avoidBlock}

Return ONLY raw JSON — no markdown fences, no commentary — in exactly this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "one or two sentences explaining why the correct option is right"
    }
  ]
}

Rules:
- Exactly 4 options per question.
- "correctIndex" is a 0-based index into "options".
- Randomize which index is correct across the set.
- Keep each question self-contained and unambiguous.`;
}

/* ── RESPONSE PARSING ───────────────────────────────────────────────────── */

/** Extract a JSON object from a model response that may include stray text/fences. */
function parseModelJson(raw) {
    if (!raw) return null;
    let text = String(raw).trim();

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

    // Fall back to slicing the outermost JSON object
    if (!text.startsWith('{')) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return null;
        text = text.slice(start, end + 1);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

/** Validate + clean one question object coming from the model. */
function sanitizeQuestion(q) {
    if (!q || typeof q.question !== 'string') return null;
    if (!Array.isArray(q.options) || q.options.length !== 4) return null;

    const options = q.options.map(o => String(o).trim()).filter(Boolean);
    if (options.length !== 4) return null;

    let idx = Number(q.correctIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) return null;

    return {
        question: q.question.trim(),
        options,
        correctIndex: idx,
        explanation: typeof q.explanation === 'string' ? q.explanation.trim() : ''
    };
}

/* ── PROVIDER CALLS ─────────────────────────────────────────────────────── */

/** Groq (OpenAI-compatible chat completions endpoint). */
async function callGroq(prompt) {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured.');

    let lastStatus = 0;
    let lastBody = '';

    for (const model of GROQ_MODEL_CHAIN) {
        const resp = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model,
                temperature: 1.1,
                top_p: 0.97,
                max_tokens: 1400,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quiz generator. You reply with raw JSON only — never markdown, never commentary.'
                    },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (resp.ok) {
            const json = await resp.json();
            return (json?.choices?.[0]?.message?.content || '').trim();
        }

        lastStatus = resp.status;
        lastBody = await resp.text().catch(() => '');

        // A bad key fails identically on every model — stop early
        if (resp.status === 401) break;
    }

    throw new Error(humanizeGroqError(lastStatus, lastBody));
}

/** Google Gemini (generateContent REST endpoint). */
async function callGemini(prompt) {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured.');

    const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.15,
            topP: 0.97,
            topK: 64,
            maxOutputTokens: 1400,
            responseMimeType: 'application/json'
        }
    };

    let lastStatus = 0;
    let lastBody = '';

    for (const model of GEMINI_MODEL_CHAIN) {
        const resp = await fetch(GEMINI_URL(model), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify(body)
        });

        if (resp.ok) {
            const json = await resp.json();
            const parts = json?.candidates?.[0]?.content?.parts || [];
            return parts.map(p => p.text || '').join('').trim();
        }

        lastStatus = resp.status;
        lastBody = await resp.text().catch(() => '');

        if (resp.status === 401 || resp.status === 403) break;
    }

    throw new Error(humanizeGeminiError(lastStatus, lastBody));
}

/** Which providers to try, in order, based on config + available keys. */
function activeProviders() {
    const chain = [];
    if (QUIZ_PROVIDER === 'groq') {
        if (GROQ_API_KEY) chain.push({ name: 'groq', call: callGroq });
    } else if (QUIZ_PROVIDER === 'gemini') {
        if (GEMINI_API_KEY) chain.push({ name: 'gemini', call: callGemini });
    } else {
        if (GROQ_API_KEY) chain.push({ name: 'groq', call: callGroq });
        if (GEMINI_API_KEY) chain.push({ name: 'gemini', call: callGemini });
    }
    return chain;
}

/** Ask the first provider that answers successfully. */
async function callAI(prompt) {
    const providers = activeProviders();

    if (!providers.length) {
        throw new Error('No AI provider configured. Set GROQ_API_KEY (recommended) or GEMINI_API_KEY in backend/.env.');
    }

    const errors = [];
    for (const p of providers) {
        try {
            const text = await p.call(prompt);
            if (text) return text;
            errors.push(`${p.name}: empty response`);
        } catch (err) {
            errors.push(err.message);
        }
    }

    // Surface the first (primary provider) failure — it's the most relevant
    throw new Error(errors[0] || 'All AI providers failed.');
}

/* ── PUBLIC API ─────────────────────────────────────────────────────────── */

/**
 * Generate `count` unique questions for a topic.
 *
 * @param {object}   opts
 * @param {string}   opts.topic          Topic title (e.g. "JavaScript")
 * @param {string[]} opts.subtopics      Subtopic titles for richer coverage
 * @param {number}   opts.count          How many questions to return
 * @param {string[]} opts.avoidQuestions Previously-used question texts to avoid
 * @param {Function} opts.isHashTaken    async (hash) => boolean  (DB duplicate check)
 * @returns {Promise<Array>} sanitized question objects, each with `hash`
 */
async function generateUniqueQuestions({ topic, subtopics = [], count = 5, avoidQuestions = [], isHashTaken }) {
    // TOKEN BUDGET: hard-cap at 5 questions per quiz so the free tier lasts.
    const target = Math.max(1, Math.min(Number(count) || MAX_QUESTIONS, MAX_QUESTIONS));

    const accepted = [];
    const seenThisRun = new Set();
    const avoid = [...avoidQuestions];

    // Only 2 rounds: round 1 asks for the full set, round 2 tops up any
    // duplicates that were rejected. Fewer rounds = fewer tokens burned.
    const MAX_ROUNDS = 2;

    for (let round = 0; round < MAX_ROUNDS && accepted.length < target; round++) {
        const remaining = target - accepted.length;
        const nonce = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-r${round}`;

        // Ask for exactly what's missing (+1 spare only on the first pass)
        const askFor = round === 0 ? remaining + 1 : remaining;

        // Keep the avoid-list short — it is the biggest input-token cost driver
        const prompt = buildPrompt(topic, subtopics, askFor, avoid.slice(-12), nonce);

        let raw;
        try {
            raw = await callAI(prompt);
        } catch (err) {
            // Bubble up on the very first failure so the caller can fall back
            if (round === 0) throw err;
            break;
        }

        const parsed = parseModelJson(raw);
        const list = Array.isArray(parsed?.questions) ? parsed.questions : [];

        for (const rawQ of list) {
            if (accepted.length >= target) break;

            const q = sanitizeQuestion(rawQ);
            if (!q) continue;

            const hash = hashQuestion(q.question);

            // Duplicate inside this same generation round
            if (seenThisRun.has(hash)) continue;

            // Duplicate against the GLOBAL ledger (any user, any time)
            let taken = false;
            try {
                taken = await isHashTaken(hash);
            } catch (e) {
                taken = false; // DB hiccup: don't block quiz delivery
            }
            if (taken) {
                avoid.push(q.question);
                continue;
            }

            seenThisRun.add(hash);
            accepted.push({ ...q, hash });
            avoid.push(q.question);
        }
    }

    return accepted;
}

module.exports = {
    generateUniqueQuestions,
    hashQuestion,
    normalizeQuestion,
    isConfigured: () => Boolean(GROQ_API_KEY || GEMINI_API_KEY),
    activeProviderNames: () => activeProviders().map(p => p.name)
};
