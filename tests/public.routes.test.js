const { app, expectPublicEndpoint } = require('./routeTestSetup');

describe('Public routes', () => {
  test('GET /api/health returns the API health payload', async () => {
    const response = await require('supertest')(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, message: 'API is running' });
  });

  test.each([
    ['post', '/api/auth/register'],
    ['post', '/api/auth/login'],
    ['post', '/api/auth/refresh'],
    ['get', '/api/auth/verify-email'],
    ['post', '/api/auth/verify-email'],
    ['post', '/api/auth/resend-verification'],
    ['post', '/api/auth/forgot-password'],
    ['post', '/api/auth/forget-password'],
    ['get', '/api/public/'],
    ['get', '/api/public/most-view'],
    ['get', '/api/public/top-rated'],
    ['get', '/api/public/most-followed'],
    ['get', '/api/public/most-favorite'],
    ['get', '/api/public/1'],
    ['get', '/api/tag/'],
    ['get', '/api/tag/1'],
    ['get', '/api/category/'],
    ['get', '/api/category/1'],
    ['get', '/api/chapter/'],
    ['get', '/api/chapter/1'],
    ['get', '/api/chapter/1/content'],
    ['get', '/api/package/'],
    ['get', '/api/package/1'],
    ['get', '/api/paymentmethod/'],
    ['get', '/api/paymentmethod/1'],
    ['get', '/api/payment-method/'],
    ['get', '/api/payment-method/1'],
    ['get', '/api/rating/1'],
    ['get', '/api/comment/1'],
  ])('%s %s is publicly reachable', expectPublicEndpoint);
});
