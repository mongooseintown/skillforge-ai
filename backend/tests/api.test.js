/**
 * SkillForge AI — Backend API Unit & Integration Test Suite
 * Evaluates core endpoints, controllers, cryptographic hashing, and validation logic.
 */

const request = require('supertest');
const app = require('../index');

describe('⚡ SkillForge AI Backend Test Suite', () => {

  // -------------------------------------------------------------
  // TEST 1: Server Health Check Endpoint
  // -------------------------------------------------------------
  test('1. [GET /api/health] should return 200 OK and active server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'active');
    expect(res.body).toHaveProperty('message');
  });

  // -------------------------------------------------------------
  // TEST 2: ELI5 AI Input Validation
  // -------------------------------------------------------------
  test('2. [POST /api/eli5/generate] should return 400 if subtopic is missing', async () => {
    const res = await request(app)
      .post('/api/eli5/generate')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  // -------------------------------------------------------------
  // TEST 3: Jobs API List Retrieval
  // -------------------------------------------------------------
  test('3. [GET /api/jobs] should return 200 and list of tech jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------
  // TEST 4: Jobs Filtering by Track
  // -------------------------------------------------------------
  test('4. [GET /api/jobs?track=frontend] should return filtered frontend jobs', async () => {
    const res = await request(app).get('/api/jobs?track=frontend');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.jobs)).toBe(true);
  });

  // -------------------------------------------------------------
  // TEST 5: Jobs Detail 404 for Non-Existent ID
  // -------------------------------------------------------------
  test('5. [GET /api/jobs/:id] should return 404 for invalid job ID', async () => {
    const res = await request(app).get('/api/jobs/invalid-id-99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Job not found.');
  });

  // -------------------------------------------------------------
  // TEST 6: Certificate Verification 404
  // -------------------------------------------------------------
  test('6. [GET /api/certificates/verify/:certId] should return 404 for non-existent certificate', async () => {
    const res = await request(app).get('/api/certificates/verify/FAKE-CERT-12345');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('valid', false);
  });

  // -------------------------------------------------------------
  // TEST 7: Roadmap Generator Input Validation
  // -------------------------------------------------------------
  test('7. [POST /api/roadmaps/generate] should return 400 if targetRole is missing', async () => {
    const res = await request(app)
      .post('/api/roadmaps/generate')
      .send({ currentSkills: 'HTML, CSS' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // -------------------------------------------------------------
  // TEST 8: Global 404 Handler
  // -------------------------------------------------------------
  test('8. [GET /api/unknown-endpoint] should return 404 for unmapped route', async () => {
    const res = await request(app).get('/api/completely-unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

});
