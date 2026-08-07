-- ============================================================================
-- SKILLFORGE AI — AI QUIZ ENGINE SCHEMA (Supabase PostgreSQL)
--
-- GUARANTEE: A generated question is NEVER repeated — not for the same user,
-- and not for any other user. Every question's normalized text is hashed
-- (SHA-256) and stored with a GLOBAL UNIQUE constraint. The AI generator must
-- produce a hash that does not already exist, otherwise it regenerates.
-- ============================================================================

-- 1. GLOBAL QUESTION FINGERPRINT LEDGER
--    One row per question ever generated across the ENTIRE platform.
--    question_hash is globally UNIQUE => absolute no-repeat guarantee.
CREATE TABLE IF NOT EXISTS quiz_question_ledger (
    id BIGSERIAL PRIMARY KEY,
    question_hash CHAR(64) UNIQUE NOT NULL,     -- SHA-256 of normalized question text
    topic VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    user_key VARCHAR(255),                      -- who first received it (firebase uid / email)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_ledger_topic ON quiz_question_ledger (topic);
CREATE INDEX IF NOT EXISTS idx_quiz_ledger_user ON quiz_question_ledger (user_key);

-- 2. QUIZ ATTEMPTS (one row per quiz session a user takes on a topic)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_key VARCHAR(255) NOT NULL,             -- firebase uid / email
    topic VARCHAR(255) NOT NULL,
    questions_json JSONB NOT NULL,              -- full generated question set (with answers)
    score INT,
    total INT,
    passed BOOLEAN,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts (user_key);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts (topic);
