const { expectProtectedEndpoint } = require('./routeTestSetup');

describe('Admin routes', () => {
  test.each([
    ['get', '/api/admin/statistic'],
    ['patch', '/api/admin/users/1/ban'],
    ['patch', '/api/admin/users/1/unban'],
    ['get', '/api/admin/transactions'],
    ['get', '/api/admin/dashboard'],
  ])('%s %s requires authentication', expectProtectedEndpoint);
});
