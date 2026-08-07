const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');

describe('⚡ SkillForge AI Backend Test Suite', () => {

  // -------------------------------------------------------------
  // TEST 1: Server Health Check Endpoint
  // -------------------------------------------------------------
  it('1. [GET /api/health] should return 200 OK and active server status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'active');
    assert.ok(res.body.message);
  });

  // -------------------------------------------------------------
  // TEST 2: ELI5 AI Input Validation
  // -------------------------------------------------------------
  it('2. [POST /api/eli5/generate] should return 400 if subtopic is missing', async () => {
    const res = await request(app)
      .post('/api/eli5/generate')
      .send({});
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error);
  });

  // -------------------------------------------------------------
  // TEST 3: Jobs API List Retrieval
  // -------------------------------------------------------------
  it('3. [GET /api/jobs] should return 200 and list of tech jobs', async () => {
    const res = await request(app).get('/api/jobs');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.jobs));
    assert.ok(res.body.jobs.length > 0);
  });

  // -------------------------------------------------------------
  // TEST 4: Jobs Filtering by Track
  // -------------------------------------------------------------
  it('4. [GET /api/jobs?track=frontend] should return filtered frontend jobs', async () => {
    const res = await request(app).get('/api/jobs?track=frontend');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.jobs));
  });

  // -------------------------------------------------------------
  // TEST 5: Jobs Detail 404 for Non-Existent ID
  // -------------------------------------------------------------
  it('5. [GET /api/jobs/:id] should return 404 for invalid job ID', async () => {
    const res = await request(app).get('/api/jobs/invalid-id-99999');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Job not found.');
  });

  // -------------------------------------------------------------
  // TEST 6: Certificate Generation & HMAC Cryptography
  // -------------------------------------------------------------
  it('6. [POST /api/certificates/issue] should issue a verifiable HMAC-signed certificate', async () => {
    const payload = {
      userName: 'Tanvir Hossain',
      userEmail: 'tanvir@skillforge.ai',
      targetRole: 'Full-Stack Developer',
      scoreMastery: 95
    };
    const res = await request(app)
      .post('/api/certificates/issue')
      .send(payload);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.certificate.certificateId);
    assert.strictEqual(res.body.certificate.verification.algorithm, 'HMAC-SHA256');
    assert.ok(res.body.certificate.verification.signature);
  });

  // -------------------------------------------------------------
  // TEST 7: Certificate Verification by ID
  // -------------------------------------------------------------
  it('7. [GET /api/certificates/verify/:certId] should verify an issued certificate', async () => {
    const res = await request(app).get('/api/certificates/verify/SF-CERT-TEST-123');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.valid, true);
    assert.ok(res.body.certificate);
  });

  // -------------------------------------------------------------
  // TEST 8: Roadmap Generator Input Validation
  // -------------------------------------------------------------
  it('8. [POST /api/roadmaps/generate] should return 400 if targetRole is missing', async () => {
    const res = await request(app)
      .post('/api/roadmaps/generate')
      .send({ currentSkills: 'HTML, CSS' });
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.error);
  });

  // -------------------------------------------------------------
  // TEST 9: Global 404 Route Handler
  // -------------------------------------------------------------
  it('9. [GET /api/unknown-endpoint] should return 404 with structured error', async () => {
    const res = await request(app).get('/api/completely-unknown-route');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Can\'t find /api/completely-unknown-route'));
  });

});
