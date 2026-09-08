const { expectProtectedEndpoint } = require('./routeTestSetup');

describe('Admin routes', () => {
  test.each([
    ['get', '/api/admin/statistic'],
    ['patch', '/api/admin/users/1/ban'],
    ['patch', '/api/admin/users/1/unban'],
    ['get', '/api/admin/transactions'],
  ])('%s %s requires authentication', expectProtectedEndpoint);
});
