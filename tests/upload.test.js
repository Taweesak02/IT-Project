const express = require('express');
const request = require('supertest');
const uploadController = require('../src/modules/upload/upload.controller');
const uploadService = require('../src/modules/upload/upload.service');
const errorHandler = require('../src/middlewares/errorHandler');

describe('upload controller', () => {
  test('returns 400 when remove request has no url', async () => {
    const app = express();
    app.use(express.json());
    app.delete('/upload/remove', uploadController.remove);
    app.use(errorHandler);

    const response = await request(app).delete('/upload/remove').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('url is required');
  });

  test('accepts a single file for chapter page uploads', async () => {
    const result = await uploadService.saveChapterPages({ filename: 'chapter-1.png' });

    expect(result).toEqual([
      { pageNumber: 1, url: '/uploads/chapter-1.png' }
    ]);
  });
});
