const request = require('supertest');

function mockEndpointHandler(_req, res) {
  res.status(204).end();
}

const controllerModules = [
  'auth',
  'comicManagement',
  'chapter',
  'tag',
  'category',
  'upload',
  'comicPublic',
  'coinPackage',
  'wallet',
  'payment',
  'paymentMethod',
  'rating',
  'favorite',
  'follow',
  'comment',
  'history',
  'notification',
  'admin',
];

const controllerPaths = {
  auth: '../src/modules/auth/auth.controller',
  comicManagement: '../src/modules/comicManagement/comicManagement.controller',
  chapter: '../src/modules/chapter/chapter.controller',
  tag: '../src/modules/tag/tag.controller',
  category: '../src/modules/category/category.controller',
  upload: '../src/modules/upload/upload.controller',
  comicPublic: '../src/modules/comicPublic/comicPublic.controller',
  coinPackage: '../src/modules/coinPackage/coinPackage.controller',
  wallet: '../src/modules/wallet/wallet.controller',
  payment: '../src/modules/payment/payment.controller',
  paymentMethod: '../src/modules/paymentMethod/paymentMethod.controller',
  rating: '../src/modules/rating/rating.controller',
  favorite: '../src/modules/favorite/favorite.controller',
  follow: '../src/modules/follow/follow.controller',
  comment: '../src/modules/comment/comment.controller',
  history: '../src/modules/history/history.controller',
  notification: '../src/modules/notification/notification.controller',
  admin: '../src/modules/admin/admin.controller',
};

controllerModules.forEach((moduleName) => {
  jest.mock(controllerPaths[moduleName], () => new Proxy({}, {
    get: () => mockEndpointHandler,
  }));
});

const app = require('../src/app/app');

function callEndpoint([method, path]) {
  return request(app)[method](path);
}

async function expectPublicEndpoint(...endpoint) {
  const response = await callEndpoint(endpoint);

  expect(response.status).toBe(204);
}

async function expectProtectedEndpoint(...endpoint) {
  const response = await callEndpoint(endpoint);

  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe('No token provided');
}

module.exports = {
  app,
  callEndpoint,
  expectPublicEndpoint,
  expectProtectedEndpoint,
};
