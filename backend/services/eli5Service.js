/* ==========================================================================
   SKILLFORGE AI — "TEACH ME LIKE I'M 5" LESSON SERVICE
   --------------------------------------------------------------------------
   Generates a full, beginner-friendly lesson for a single subtopic. The
   explanation is written as if teaching a curious five-year-old: plain
   English, everyday analogies, tiny steps — but still technically correct,
   with real code snippets and practice questions at the end.

   Reuses the same provider chain as the quiz service (Groq first, Gemini as
   a fallback) so there is only one place to configure API keys.
   ========================================================================== */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const QUIZ_PROVIDER = (process.env.QUIZ_PROVIDER || 'auto').trim().toLowerCase();

const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL_CHAIN = [
    GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
].filter((m, i, arr) => m && arr.indexOf(m) === i);

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
const GEMINI_URL = (model) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/* ── PROMPT ─────────────────────────────────────────────────────────────── */

function buildLessonPrompt(subtopic, topic) {
    const context = topic ? ` (part of the "${topic}" module)` : '';

    return `Write a complete beginner lesson about "${subtopic}"${context}.

AUDIENCE: someone who knows nothing about this. Explain it the way you would explain it to a curious five-year-old — simple words, everyday analogies, one small idea at a time. Never assume prior knowledge. But stay technically accurate: a real developer reading this should not find anything wrong.

LANGUAGE: English only.

Return ONLY raw JSON — no markdown fences, no commentary — in exactly this shape:
{
  "title": "short lesson title",
  "oneLiner": "a single sentence a five-year-old would understand",
  "sections": [
    {
      "heading": "section heading",
      "body": "2-4 short paragraphs in plain English. Use analogies. Separate paragraphs with \\n\\n.",
      "code": {
        "language": "html | css | javascript | bash | json | none",
        "snippet": "a small, runnable example. Use \\n for newlines. Empty string if this section needs no code.",
        "explain": "one or two sentences walking through what the code does, line by line in spirit"
      }
    }
  ],
  "keyTakeaways": ["short memorable point", "..."],
  "practiceQuestions": [
    {
      "question": "a hands-on task or question the learner can actually try",
      "hint": "a nudge in the right direction, not the answer",
      "answer": "the worked answer, including code when relevant"
    }
  ]
}

Rules:
- 4 to 6 sections, ordered from "what even is this" to "how do I actually use it".
- At least 3 sections must contain a real code snippet.
- Exactly 5 keyTakeaways.
- Exactly 5 practiceQuestions, rising from easy to genuinely challenging.
- Keep every paragraph short. Long walls of text defeat the purpose.`;
}

/* ── PROVIDER CALLS ─────────────────────────────────────────────────────── */

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
                temperature: 0.75,
                max_tokens: 6000,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a patient teacher who explains programming to absolute beginners. You reply with raw JSON only — never markdown, never commentary.'
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
        if (resp.status === 401) break;
    }

    let apiMsg = '';
    try { apiMsg = JSON.parse(lastBody)?.error?.message || ''; } catch (e) { }

    if (lastStatus === 401) {
        return Promise.reject(new Error('Groq rejected the API key. Create a new one at https://console.groq.com/keys and set GROQ_API_KEY in backend/.env.'));
    }
    if (lastStatus === 429) {
        return Promise.reject(new Error('Groq rate limit reached. Wait a minute and try again.'));
    }
    throw new Error(apiMsg ? `Groq error ${lastStatus}: ${apiMsg.slice(0, 200)}` : `Groq API responded with HTTP ${lastStatus}.`);
}

async function callGemini(prompt) {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured.');

    const resp = await fetch(GEMINI_URL(GEMINI_MODEL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 6000,
                responseMimeType: 'application/json'
            }
        })
    });

    if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        let apiMsg = '';
        try { apiMsg = JSON.parse(body)?.error?.message || ''; } catch (e) { }
        throw new Error(apiMsg ? `Gemini error ${resp.status}: ${apiMsg.slice(0, 200)}` : `Gemini API responded with HTTP ${resp.status}.`);
    }

    const json = await resp.json();
    const parts = json?.candidates?.[0]?.content?.parts || [];
    return parts.map(p => p.text || '').join('').trim();
}

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
    throw new Error(errors[0] || 'All AI providers failed.');
}

/* ── PARSING ────────────────────────────────────────────────────────────── */

function parseModelJson(raw) {
    if (!raw) return null;
    let text = String(raw).trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

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

const str = (v) => (typeof v === 'string' ? v.trim() : '');

/** Shape whatever the model returned into a predictable lesson object. */
function sanitizeLesson(raw, subtopic) {
    if (!raw || typeof raw !== 'object') return null;

    const sections = (Array.isArray(raw.sections) ? raw.sections : [])
        .map(s => {
            const heading = str(s?.heading);
            const body = str(s?.body);
            if (!heading && !body) return null;

            const code = s?.code || {};
            const snippet = str(code.snippet);

            return {
                heading: heading || 'Let’s look at this',
                body,
                code: snippet
                    ? {
                        language: (str(code.language) || 'text').toLowerCase(),
                        snippet,
                        explain: str(code.explain)
                    }
                    : null
            };
        })
        .filter(Boolean);

    if (!sections.length) return null;

    const keyTakeaways = (Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [])
        .map(str)
        .filter(Boolean);

    const practiceQuestions = (Array.isArray(raw.practiceQuestions) ? raw.practiceQuestions : [])
        .map(q => {
            const question = str(q?.question);
            if (!question) return null;
            return {
                question,
                hint: str(q?.hint),
                answer: str(q?.answer)
            };
        })
        .filter(Boolean);

    return {
        title: str(raw.title) || subtopic,
        oneLiner: str(raw.oneLiner),
        sections,
        keyTakeaways,
        practiceQuestions
    };
}

/* ── PUBLIC API ─────────────────────────────────────────────────────────── */

/**
 * Generate an ELI5 lesson for a single subtopic.
 *
 * @param {object} opts
 * @param {string} opts.subtopic  The subtopic to teach (required)
 * @param {string} opts.topic     Parent module, used only for context
 * @returns {Promise<object>} { title, oneLiner, sections[], keyTakeaways[], practiceQuestions[] }
 */
async function generateLesson({ subtopic, topic = '' }) {
    const clean = str(subtopic);
    if (!clean) throw new Error('A subtopic is required.');

    const raw = await callAI(buildLessonPrompt(clean, str(topic)));
    const lesson = sanitizeLesson(parseModelJson(raw), clean);

    if (!lesson) {
        throw new Error('The AI returned a lesson that could not be read. Please try again.');
    }
    return lesson;
}

module.exports = {
    generateLesson,
    isConfigured: () => Boolean(GROQ_API_KEY || GEMINI_API_KEY)
};
