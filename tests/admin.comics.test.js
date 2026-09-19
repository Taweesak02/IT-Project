jest.mock('../src/configs/db', () => ({
    comic: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((queries) => Promise.all(queries))
}));
const prisma = require('../src/configs/db');
const { searchAdminComics, setComicApproval } = require('../src/modules/admin/admin.service');

beforeEach(() => jest.clearAllMocks());

test.each(['user', null, undefined])('non-admin %s cannot search or moderate comics', async (role) => {
    await expect(searchAdminComics(role, {})).rejects.toMatchObject({ statusCode: 403 });
    await expect(setComicApproval(role, 1, 'APPROVED')).rejects.toMatchObject({ statusCode: 403 });
    expect(prisma.comic.findMany).not.toHaveBeenCalled();
    expect(prisma.comic.update).not.toHaveBeenCalled();
});

test('admin search includes every approval state, with title matching and pagination', async () => {
    const comics = ['APPROVED', 'UNAPPROVED', 'RESUBMIT'].map((approved, index) => ({
        id: index + 1, title: 'Comic ' + index, approved, isActive: true
    }));
    prisma.comic.findMany.mockResolvedValue(comics);
    prisma.comic.count.mockResolvedValue(23);
    const result = await searchAdminComics('admin', { title: ' Comic ', page: '2', limit: '20' });
    expect(result).toEqual({ comics, pagination: { page: 2, limit: 20, total: 23, totalPages: 2 } });
    const query = prisma.comic.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ title: { contains: 'Comic', mode: 'insensitive' } });
    expect(query).toMatchObject({ skip: 20, take: 20 });
    expect(prisma.comic.count).toHaveBeenCalledWith({ where: query.where });
});

test('empty search lists all comics', async () => {
    prisma.comic.findMany.mockResolvedValue([]);
    prisma.comic.count.mockResolvedValue(0);
    await searchAdminComics('admin', { title: '  ' });
    expect(prisma.comic.findMany.mock.calls[0][0].where).toEqual({});
});

test.each([{ page: '0' }, { page: '1.5' }, { limit: '101' }, { limit: 'abc' }, { title: ['a'] }])('invalid query %j fails before database access', async (query) => {
    await expect(searchAdminComics('admin', query)).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.comic.findMany).not.toHaveBeenCalled();
});

test.each(['APPROVED', 'UNAPPROVED'])('moderation sets %s without changing active state', async (approved) => {
    prisma.comic.findUnique.mockResolvedValue({ id: 1, isActive: false });
    prisma.comic.update.mockResolvedValue({ id: 1, approved, isActive: false });
    await expect(setComicApproval('admin', 1, approved)).resolves.toMatchObject({ approved, isActive: false });
    expect(prisma.comic.update.mock.calls[0][0].data).toEqual({ approved, resubmitAt: null });
});

test('moderating a missing comic returns 404', async () => {
    prisma.comic.findUnique.mockResolvedValue(null);
    await expect(setComicApproval('admin', 999, 'APPROVED')).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.comic.update).not.toHaveBeenCalled();
});

test('resubmission queue filters before pagination and counts only matching comics', async () => {
    prisma.comic.findMany.mockResolvedValue([{ id: 21, title: 'Comic', approved: 'RESUBMIT' }]);
    prisma.comic.count.mockResolvedValue(21);
    const result = await searchAdminComics('admin', { title: ' Comic ', approved: 'RESUBMIT', page: 2, limit: 20 });
    const where = { title: { contains: 'Comic', mode: 'insensitive' }, approved: 'RESUBMIT' };
    expect(prisma.comic.findMany).toHaveBeenCalledWith(expect.objectContaining({ where, skip: 20, take: 20 }));
    expect(prisma.comic.count).toHaveBeenCalledWith({ where });
    expect(result.pagination).toEqual({ page: 2, limit: 20, total: 21, totalPages: 2 });
});

test('resubmissions can be fetched without a title', async () => {
    prisma.comic.findMany.mockResolvedValue([]);
    prisma.comic.count.mockResolvedValue(0);
    await searchAdminComics('admin', { approved: 'RESUBMIT' });
    expect(prisma.comic.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { approved: 'RESUBMIT' } }));
});

test.each(['INVALID', '', ['RESUBMIT'], { equals: 'RESUBMIT' }])('invalid approval filter %j is rejected', async (approved) => {
    await expect(searchAdminComics('admin', { approved })).rejects.toMatchObject({ statusCode: 400 });
    expect(prisma.comic.findMany).not.toHaveBeenCalled();
});

test('approving a resubmitted comic clears the resubmission date', async () => {
    prisma.comic.findUnique.mockResolvedValue({ id: 1, approved: 'RESUBMIT', resubmitAt: new Date(), isActive: true });
    prisma.comic.update.mockResolvedValue({ id: 1, approved: 'APPROVED', resubmitAt: null, isActive: true });
    await expect(setComicApproval('admin', 1, 'APPROVED')).resolves.toMatchObject({ approved: 'APPROVED', resubmitAt: null });
    expect(prisma.comic.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 }, data: { approved: 'APPROVED', resubmitAt: null } }));
});