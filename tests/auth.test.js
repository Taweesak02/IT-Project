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

  it('returns 400 when verify-email token is missing', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/token/i);
  });

  it('returns 400 when resend-verification email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });

  it('returns 400 when forgot-password email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });

  it('returns 400 when reset-password payload is missing', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/reset token/i);
  });

  it('returns 401 when change-password is called without auth', async () => {
    const response = await request(app)
      .patch('/api/auth/change-password')
      .send({ currentPassword: 'old123', newPassword: 'new123456' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it('returns 401 when update-profile is called without auth', async () => {
    const response = await request(app)
      .patch('/api/auth/update-profile')
      .send({ username: 'newname' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it('returns 401 when update-email is called without auth', async () => {
    const response = await request(app)
      .patch('/api/auth/update-email')
      .send({ currentPassword: 'old123', newEmail: 'new@example.com' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it('returns 401 when delete-account is called without auth', async () => {
    const response = await request(app)
      .delete('/api/auth/delete-account')
      .send({ currentPassword: 'old123' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it('returns 401 when logout-all is called without auth', async () => {
    const response = await request(app)
      .post('/api/auth/logout-all')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });
});
