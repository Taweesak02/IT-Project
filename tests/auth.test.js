const request = require('supertest');
const app = require('../index');

describe('Auth routes', () => {
  it('returns 400 when register payload is missing password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password/i);
  });
});
