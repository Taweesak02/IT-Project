const { expectProtectedEndpoint } = require('./routeTestSetup');

describe('Content management routes', () => {
  test.each([
    ['get', '/api/comic-manage/'],
    ['get', '/api/comic-manage/overview'],
    ['get', '/api/comic-manage/1/statistic'],
    ['get', '/api/comic-manage/1'],
    ['post', '/api/comic-manage/'],
    ['patch', '/api/comic-manage/1'],
    ['patch', '/api/comic-manage/1/resubmit'],
    ['delete', '/api/comic-manage/1'],
    ['post', '/api/chapter/'],
    ['get', '/api/chapter/unlocked'],
    ['patch', '/api/chapter/1'],
    ['put', '/api/chapter/1/pages'],
    ['delete', '/api/chapter/1'],
    ['post', '/api/chapter/1/unlock'],
    ['post', '/api/tag/'],
    ['patch', '/api/tag/1'],
    ['delete', '/api/tag/1'],
    ['post', '/api/category/'],
    ['patch', '/api/category/1'],
    ['delete', '/api/category/1'],
    ['post', '/api/upload/cover'],
    ['post', '/api/upload/chapter'],
    ['post', '/api/upload/avatar'],
    ['delete', '/api/upload/'],
    ['post', '/api/package/'],
    ['patch', '/api/package/1'],
    ['delete', '/api/package/1'],
  ])('%s %s requires authentication', expectProtectedEndpoint);
});
