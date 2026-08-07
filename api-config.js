/**
 * SKILLFORGE AI — GLOBAL API CONFIGURATION
 * Auto-detects local vs production environment.
 */
window.SKILLFORGE_CONFIG = (function() {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  const BACKEND_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://skillforge-ai-backend-bbho.onrender.com';

  return {
    isLocal,
    BACKEND_URL,
    API_BASE: `${BACKEND_URL}/api`,
    QUIZ_API: `${BACKEND_URL}/api/quiz`,
    ELI5_API: `${BACKEND_URL}/api/eli5`,
    JOBS_API: `${BACKEND_URL}/api/jobs`,
    ROADMAP_API: `${BACKEND_URL}/api/roadmaps`,
    CERT_API: `${BACKEND_URL}/api/certificates`
  };
})();
