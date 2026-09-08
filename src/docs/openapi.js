const jsonBody = (properties, required = []) => ({
  content: {
    'application/json': {
      schema: { type: 'object', properties, ...(required.length > 0 ? { required } : {}) },
    },
  },
});

const id = (name, description = 'Numeric resource identifier') => ({ name, in: 'path', required: true, description, schema: { type: 'integer', minimum: 1 } });
const auth = { bearerAuth: [] };
const response = (description = 'Successful response') => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } });
const operation = (summary, { secured = false, parameters = [], body, tags = ['General'], method = 'get', description } = {}) => ({
  tags, summary, description, operationId: `${method}_${summary.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  ...(secured ? { security: [auth] } : {}), parameters, ...(body ? { requestBody: body } : {}),
  responses: { 200: response(), 201: response('Resource created'), 400: { $ref: '#/components/responses/BadRequest' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { $ref: '#/components/responses/NotFound' } },
});

const paths = {};
const add = (path, method, summary, options = {}) => {
  paths[path] ??= {};
  paths[path][method] = operation(summary, { ...options, method });
  paths[path][method].operationId = `${method}_${path.replace(/[^a-zA-Z0-9]+/g, '_')}`;
};
const addAliases = (bases, suffix, method, summary, options = {}) => bases.forEach((base) => add(`${base}${suffix}`, method, summary, options));

add('/health', 'get', 'Check API health');

const authTag = ['Authentication'];
add('/auth/register', 'post', 'Register a user', { tags: authTag, body: jsonBody({ email: { type: 'string', format: 'email' }, username: { type: 'string' }, password: { type: 'string', format: 'password' } }, ['email', 'password']) });
add('/auth/login', 'post', 'Log in', { tags: authTag, body: jsonBody({ email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } }, ['email', 'password']) });
add('/auth/refresh', 'post', 'Refresh access token', { tags: authTag, body: jsonBody({ refreshToken: { type: 'string' } }, ['refreshToken']) });
add('/auth/logout', 'post', 'Log out', { tags: authTag, secured: true, body: jsonBody({ refreshToken: { type: 'string' } }) });
add('/auth/logout-all', 'post', 'Log out from all devices', { tags: authTag, secured: true });
add('/auth/me', 'get', 'Get current user', { tags: authTag, secured: true });
add('/auth/verify-email', 'get', 'Verify email with query parameters', { tags: authTag, parameters: [{ name: 'token', in: 'query', required: true, schema: { type: 'string' } }] });
add('/auth/verify-email', 'post', 'Verify email', { tags: authTag, body: jsonBody({ token: { type: 'string' } }, ['token']) });
add('/auth/resend-verification', 'post', 'Resend verification email', { tags: authTag, body: jsonBody({ email: { type: 'string', format: 'email' } }, ['email']) });
['forgot-password', 'forget-password'].forEach((path) => add(`/auth/${path}`, 'post', 'Request password reset', { tags: authTag, body: jsonBody({ email: { type: 'string', format: 'email' } }, ['email']) }));
add('/auth/reset-password', 'post', 'Reset password', { tags: authTag, body: jsonBody({ token: { type: 'string' }, newPassword: { type: 'string', format: 'password' } }, ['token', 'newPassword']) });
add('/auth/change-password', 'patch', 'Change password', { tags: authTag, secured: true, body: jsonBody({ currentPassword: { type: 'string', format: 'password' }, newPassword: { type: 'string', format: 'password' } }, ['currentPassword', 'newPassword']) });
add('/auth/update-profile', 'patch', 'Update profile', { tags: authTag, secured: true, body: jsonBody({ username: { type: 'string' }, profileImage: { type: 'string' } }) });
['update-email', 'updateemail'].forEach((path) => add(`/auth/${path}`, 'patch', 'Update email', { tags: authTag, secured: true, body: jsonBody({ currentPassword: { type: 'string', format: 'password' }, newEmail: { type: 'string', format: 'email' } }, ['currentPassword', 'newEmail']) }));
['delete-account', 'deleteaccount'].forEach((path) => add(`/auth/${path}`, 'delete', 'Delete account', { tags: authTag, secured: true, body: jsonBody({ currentPassword: { type: 'string', format: 'password' } }, ['currentPassword']) }));

const contentBases = ['/comic-manage', '/comicmanage'];
addAliases(contentBases, '/', 'get', 'List my comics', { secured: true, tags: ['Comic management'] });
addAliases(contentBases, '/', 'post', 'Create a comic', { secured: true, tags: ['Comic management'], body: jsonBody({ title: { type: 'string' }, description: { type: 'string' }, coverImage: { type: 'string' }, categoryIds: { type: 'array', items: { type: 'integer' } }, tagIds: { type: 'array', items: { type: 'integer' } } }, ['title']) });
addAliases(contentBases, '/{id}', 'get', 'Get owned comic', { secured: true, tags: ['Comic management'], parameters: [id('id')] });
addAliases(contentBases, '/{id}', 'patch', 'Edit a comic', { secured: true, tags: ['Comic management'], parameters: [id('id')], body: jsonBody({ title: { type: 'string' }, description: { type: 'string' }, coverImage: { type: 'string' }, status: { type: 'string' }, categoryIds: { type: 'array', items: { type: 'integer' } }, tagIds: { type: 'array', items: { type: 'integer' } } }) });
addAliases(contentBases, '/{id}', 'delete', 'Delete a comic', { secured: true, tags: ['Comic management'], parameters: [id('id')] });
addAliases(contentBases, '/{id}/statistic', 'get', 'Get comic statistics', { secured: true, tags: ['Comic management'], parameters: [id('id')] });

const publicBases = ['/public'];
addAliases(publicBases, '/', 'get', 'Search public comics', {
  tags: ['Public comics'],
  parameters: ['title', 'comicname', 'tag', 'tags', 'category', 'categorys', 'sort', 'page', 'limit'].map((name) => ({ name, in: 'query', schema: { type: 'string' } }))
});
['most-view', 'top-rated', 'most-followed', 'most-favorite'].forEach((name) => addAliases(publicBases, `/${name}`, 'get', `Get ${name} comics`, {
  tags: ['Public comics'],
  parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } }]
}));
addAliases(publicBases, '/user', 'get', 'Search public users', {
  tags: ['Public comics'],
  parameters: [
    { name: 'username', in: 'query', description: 'Username search text', schema: { type: 'string' } },
    { name: 'sort', in: 'query', description: 'latest, oldest, or username', schema: { type: 'string', enum: ['latest', 'oldest', 'username'] } },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } }
  ]
});
addAliases(publicBases, '/user/{userId}', 'get', 'Get public comics by user', {
  tags: ['Public comics'],
  parameters: [id('userId')]
});
addAliases(publicBases, '/{comicId}', 'get', 'Get public comic detail', { tags: ['Public comics'], parameters: [id('comicId')] });

add('/chapter/', 'get', 'List chapters for a comic', { tags: ['Chapters'], parameters: [{ name: 'comicId', in: 'query', required: true, schema: { type: 'integer' } }] });
add('/chapter/', 'post', 'Create a chapter', { tags: ['Chapters'], secured: true, body: jsonBody({ comicId: { type: 'integer' }, chapterNumber: { type: 'integer' }, title: { type: 'string' }, coinCost: { type: 'integer' }, pages: { type: 'array', items: { type: 'string' } } }, ['comicId', 'title', 'pages']) });
add('/chapter/unlocked', 'get', 'List my unlocked chapters', { tags: ['Chapters'], secured: true, parameters: [{ name: 'comicId', in: 'query', schema: { type: 'integer', minimum: 1 } }], description: 'Returns chapter metadata for the authenticated user’s unlocks, optionally filtered by comicId. Returns an empty array when none match.' });
add('/chapter/{chapterId}', 'get', 'Get chapter metadata', { tags: ['Chapters'], parameters: [id('chapterId')] });
add('/chapter/{chapterId}', 'patch', 'Edit a chapter', { tags: ['Chapters'], secured: true, parameters: [id('chapterId')], body: jsonBody({ title: { type: 'string' }, coinCost: { type: 'integer' } }) });
add('/chapter/{chapterId}', 'delete', 'Delete a chapter', { tags: ['Chapters'], secured: true, parameters: [id('chapterId')] });
add('/chapter/{chapterId}/content', 'get', 'Read chapter content', { tags: ['Chapters'], parameters: [id('chapterId')], description: 'Public for free chapters; authentication is optional for paid chapters.' });
add('/chapter/{chapterId}/unlock', 'post', 'Unlock a paid chapter', { tags: ['Chapters'], secured: true, parameters: [id('chapterId')] });
add('/chapter/{chapterId}/pages', 'put', 'Replace chapter pages', { tags: ['Chapters'], secured: true, parameters: [id('chapterId')], body: jsonBody({ pages: { type: 'array', items: { type: 'string' } } }, ['pages']) });

[['tag', 'Tag', 'tagId'], ['category', 'Category', 'categoryId']].forEach(([base, label, param]) => {
  add(`/${base}/`, 'get', `List ${label.toLowerCase()}s`, { tags: [label] });
  add(`/${base}/`, 'post', `Create ${label.toLowerCase()}`, { tags: [label], secured: true, body: jsonBody({ name: { type: 'string' } }, ['name']) });
  add(`/${base}/{${param}}`, 'get', `Get ${label.toLowerCase()}`, { tags: [label], parameters: [id(param)] });
  add(`/${base}/{${param}}`, 'patch', `Update ${label.toLowerCase()}`, { tags: [label], secured: true, parameters: [id(param)], body: jsonBody({ name: { type: 'string' } }, ['name']) });
  add(`/${base}/{${param}}`, 'delete', `Delete ${label.toLowerCase()}`, { tags: [label], secured: true, parameters: [id(param)] });
});

['cover', 'chapter', 'avatar'].forEach((kind) => add(`/upload/${kind}`, 'post', `Upload ${kind}`, { tags: ['Uploads'], secured: true, body: { content: { 'multipart/form-data': { schema: { type: 'object', required: ['image'], properties: { image: { type: 'string', format: 'binary' } } } } } } }));
add('/upload/', 'delete', 'Delete uploaded file', { tags: ['Uploads'], secured: true, body: jsonBody({ url: { type: 'string' } }, ['url']) });

add('/package/', 'get', 'List coin packages', { tags: ['Payments'] });
add('/package/', 'post', 'Create coin package', { tags: ['Payments'], secured: true, body: jsonBody({ name: { type: 'string' }, coinAmount: { type: 'integer' }, price: { type: 'number' } }, ['name', 'coinAmount', 'price']) });
add('/package/{packageId}', 'get', 'Get coin package', { tags: ['Payments'], parameters: [id('packageId')] });
add('/package/{packageId}', 'patch', 'Update coin package', { tags: ['Payments'], secured: true, parameters: [id('packageId')], body: jsonBody({ name: { type: 'string' }, coinAmount: { type: 'integer' }, price: { type: 'number' }, isactive: { type: 'boolean' } }) });
add('/package/{packageId}', 'delete', 'Deactivate coin package', { tags: ['Payments'], secured: true, parameters: [id('packageId')] });
add('/wallet/', 'get', 'Get my wallet', { tags: ['Wallet'], secured: true });
add('/wallet/history', 'get', 'Get wallet transactions', { tags: ['Wallet'], secured: true });
add('/payment/purchase', 'post', 'Purchase a coin package', { tags: ['Payments'], secured: true, body: jsonBody({ packageId: { type: 'integer' }, paymentMethodId: { type: 'integer' } }, ['packageId', 'paymentMethodId']) });
add('/payment/status/{paymentTransactionId}', 'get', 'Get payment status', { tags: ['Payments'], secured: true, parameters: [id('paymentTransactionId')] });
add('/payment/history', 'get', 'Get my payment history', { tags: ['Payments'], secured: true });
['paymentmethod', 'payment-method'].forEach((base) => {
  add(`/${base}/`, 'get', 'List payment methods', { tags: ['Payments'] });
  add(`/${base}/`, 'post', 'Create payment method', { tags: ['Payments'], secured: true, body: jsonBody({ name: { type: 'string' }, code: { type: 'string' } }, ['name', 'code']) });
  add(`/${base}/{paymentMethodId}`, 'get', 'Get payment method', { tags: ['Payments'], parameters: [id('paymentMethodId')] });
  add(`/${base}/{paymentMethodId}`, 'patch', 'Update payment method', { tags: ['Payments'], secured: true, parameters: [id('paymentMethodId')], body: jsonBody({ name: { type: 'string' }, code: { type: 'string' }, isActive: { type: 'boolean' } }) });
  add(`/${base}/{paymentMethodId}`, 'delete', 'Deactivate payment method', { tags: ['Payments'], secured: true, parameters: [id('paymentMethodId')] });
});

add('/rating/{comicId}', 'get', 'Get comic ratings', { tags: ['Community'], parameters: [id('comicId')] });
add('/rating/{comicId}', 'post', 'Rate a comic', { tags: ['Community'], secured: true, parameters: [id('comicId')], body: jsonBody({ rating: { type: 'integer', minimum: 1, maximum: 5 } }, ['rating']) });
add('/rating/{comicId}', 'delete', 'Remove my rating', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/rating/{comicId}/me', 'get', 'Get my rating', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/favorite/', 'get', 'List my favorites', { tags: ['Community'], secured: true });
add('/favorite/{comicId}', 'post', 'Favorite a comic', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/favorite/{comicId}', 'delete', 'Remove a favorite', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/follow/', 'get', 'List comics I follow', { tags: ['Community'], secured: true });
add('/follow/{comicId}', 'post', 'Follow a comic', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/follow/{comicId}', 'delete', 'Unfollow a comic', { tags: ['Community'], secured: true, parameters: [id('comicId')] });
add('/comment/{chapterId}', 'get', 'List chapter comments', { tags: ['Community'], parameters: [id('chapterId')] });
add('/comment/{chapterId}', 'post', 'Add a comment', { tags: ['Community'], secured: true, parameters: [id('chapterId')], body: jsonBody({ content: { type: 'string' } }, ['content']) });
add('/comment/{commentId}', 'patch', 'Edit a comment', { tags: ['Community'], secured: true, parameters: [id('commentId')], body: jsonBody({ content: { type: 'string' } }, ['content']) });
add('/comment/{commentId}', 'delete', 'Delete a comment', { tags: ['Community'], secured: true, parameters: [id('commentId')] });
add('/history/', 'get', 'Get reading history', { tags: ['Community'], secured: true });
add('/notification/', 'get', 'Get notifications', { tags: ['Community'], secured: true });
add('/notification/{notificationId}/read', 'patch', 'Mark notification as read', { tags: ['Community'], secured: true, parameters: [id('notificationId')] });

const transactionQuery = ['page', 'limit', 'status'].map((name) => ({ name, in: 'query', schema: { type: 'string' } }));
add('/admin/statistic', 'get', 'Get platform statistics', { tags: ['Admin'], secured: true });
add('/admin/users/{id}/ban', 'patch', 'Ban a user', { tags: ['Admin'], secured: true, parameters: [id('id')] });
add('/admin/users/{id}/unban', 'patch', 'Unban a user', { tags: ['Admin'], secured: true, parameters: [id('id')] });
add('/admin/transactions', 'get', 'List payment transactions', { tags: ['Admin'], secured: true, parameters: transactionQuery });
add('/admin/dashboard', 'get', 'Get admin dashboard', { tags: ['Admin'], secured: true });

module.exports = {
  openapi: '3.0.3',
  info: { title: 'Online Comic System Backend API', version: '1.0.0', description: 'เอกสาร API สำหรับระบบการ์ตูนออนไลน์ (Backend)' },
  servers: [{ url: '/api', description: 'Current API server' }],
  tags: ['Authentication', 'Comic management', 'Public comics', 'Chapters', 'Tag', 'Category', 'Uploads', 'Payments', 'Wallet', 'Community', 'Admin'].map((name) => ({ name })),
  paths,
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter only the JWT access token. Swagger UI adds the Bearer prefix.' } },
    schemas: { ApiResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: {}, message: { type: 'string' } } } },
    responses: { BadRequest: { description: 'Invalid request' }, Unauthorized: { description: 'Authentication required or token is invalid' }, Forbidden: { description: 'Insufficient permissions' }, NotFound: { description: 'Resource not found' } },
  },
};
