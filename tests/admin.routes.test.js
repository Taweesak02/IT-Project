const { expectProtectedEndpoint } = require('./routeTestSetup');

describe('Admin routes', () => {
  test.each([
    ['get', '/api/admin/statistic'],
    ['get', '/api/admin/comics'],
    ['patch', '/api/admin/users/1/ban'],
    ['patch', '/api/admin/users/1/unban'],
    ['patch', '/api/admin/comics/1/approve'],
    ['patch', '/api/admin/comics/1/unapprove'],
    ['get', '/api/admin/transactions'],
  ])('%s %s requires authentication', expectProtectedEndpoint);
});
