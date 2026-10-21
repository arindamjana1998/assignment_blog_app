import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('Health & Root API Integration Tests', () => {
  test('GET / should return 200 with API status information', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('name', 'MERN Blog Application API');
    expect(response.body.data).toHaveProperty('status', 'ONLINE');
    expect(response.body.data).toHaveProperty('endpoints');
  });

  test('GET /health should return system status', async () => {
    const response = await request(app).get('/health');

    // Either 200 (if connected) or 503 (if disconnected in isolated test)
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
  });

  test('GET /api/v1/non-existent-route should return 404 with standardized error envelope', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message');
  });
});
