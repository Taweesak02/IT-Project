jest.mock('../src/configs/db', () => ({
    favoriteComic: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    followComic: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    comment: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    comic: { findUnique: jest.fn() },
    chapter: { findUnique: jest.fn() },
    category: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    tag: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    notification: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), createMany: jest.fn() },
}));

const prisma = require('../src/configs/db');
const favorite = require('../src/modules/favorite/favorite.service');
const follow = require('../src/modules/follow/follow.service');
const comment = require('../src/modules/comment/comment.service');
const category = require('../src/modules/category/category.service');
const tag = require('../src/modules/tag/tag.service');
const notification = require('../src/modules/notification/notification.service');

beforeEach(() => jest.clearAllMocks());

test('favorites and follows support list, create, duplicate, and removal flows', async () => {
    const favoriteRows = [{ id: 1 }];
    prisma.favoriteComic.findMany.mockResolvedValue(favoriteRows);
    await expect(favorite.getMyFavorites(4)).resolves.toBe(favoriteRows);

    prisma.comic.findUnique.mockResolvedValue({ id: 9 });
    prisma.favoriteComic.create.mockResolvedValue({ id: 2 });
    await expect(favorite.addFavorite(9, 4)).resolves.toEqual({ id: 2 });
    prisma.favoriteComic.create.mockRejectedValue({ code: 'P2002' });
    await expect(favorite.addFavorite(9, 4)).rejects.toMatchObject({ statusCode: 409 });
    prisma.comic.findUnique.mockResolvedValue(null);
    await expect(favorite.addFavorite(9, 4)).rejects.toMatchObject({ statusCode: 404 });

    prisma.favoriteComic.findUnique.mockResolvedValue({ id: 2 });
    await expect(favorite.removeFavorite(9, 4)).resolves.toEqual({ message: 'Removed from favorites' });
    prisma.favoriteComic.findUnique.mockResolvedValue(null);
    await expect(favorite.removeFavorite(9, 4)).rejects.toMatchObject({ statusCode: 404 });

    prisma.followComic.findMany.mockResolvedValue([{ id: 3 }]);
    await expect(follow.getMyFollowed(4)).resolves.toEqual([{ id: 3 }]);
    prisma.comic.findUnique.mockResolvedValue({ id: 9 });
    prisma.followComic.create.mockResolvedValue({ id: 4 });
    await expect(follow.followComic(9, 4)).resolves.toEqual({ id: 4 });
    prisma.followComic.create.mockRejectedValue({ code: 'P2002' });
    await expect(follow.followComic(9, 4)).rejects.toMatchObject({ statusCode: 409 });
    prisma.followComic.findUnique.mockResolvedValue({ id: 4 });
    await expect(follow.unFollowComic(9, 4)).resolves.toEqual({ message: 'Unfollowed' });
    prisma.followComic.findUnique.mockResolvedValue(null);
    await expect(follow.unFollowComic(9, 4)).rejects.toMatchObject({ statusCode: 404 });
});

test('comments validate input and enforce ownership unless admin', async () => {
    prisma.comment.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(comment.getCommentsByChapter(7)).resolves.toEqual([{ id: 1 }]);
    await expect(comment.getCommentsByChapter(0)).rejects.toMatchObject({ statusCode: 400 });

    await expect(comment.addComment(7, 4, '  ')).rejects.toMatchObject({ statusCode: 400 });
    prisma.chapter.findUnique.mockResolvedValue(null);
    await expect(comment.addComment(7, 4, 'hello')).rejects.toMatchObject({ statusCode: 404 });
    prisma.chapter.findUnique.mockResolvedValue({ id: 7 });
    prisma.comment.create.mockResolvedValue({ id: 2, content: 'hello' });
    await expect(comment.addComment(7, 4, ' hello ')).resolves.toEqual({ id: 2, content: 'hello' });

    prisma.comment.findUnique.mockResolvedValue(null);
    await expect(comment.editComment(2, 4, 'user', 'new')).rejects.toMatchObject({ statusCode: 404 });
    prisma.comment.findUnique.mockResolvedValue({ id: 2, userId: 8 });
    await expect(comment.editComment(2, 4, 'user', 'new')).rejects.toMatchObject({ statusCode: 403 });
    await expect(comment.editComment(2, 4, 'admin', ' ')).rejects.toMatchObject({ statusCode: 400 });
    prisma.comment.update.mockResolvedValue({ id: 2, content: 'new' });
    await expect(comment.editComment(2, 4, 'admin', ' new ')).resolves.toEqual({ id: 2, content: 'new' });

    prisma.comment.delete.mockResolvedValue(undefined);
    await expect(comment.removeComment(2, 4, 'admin')).resolves.toEqual({ message: 'Comment deleted' });
});

test('categories and tags normalize names and cover admin and duplicate errors', async () => {
    prisma.category.create.mockResolvedValue({ id: 1, name: 'action' });
    await expect(category.addCategory('admin', ' Action ')).resolves.toEqual({ category: { id: 1, name: 'action' } });
    await expect(category.addCategory('user', 'action')).rejects.toMatchObject({ statusCode: 403 });
    await expect(category.addCategory('admin', ' ')).rejects.toMatchObject({ statusCode: 400 });
    prisma.category.create.mockRejectedValue({ code: 'P2002' });
    await expect(category.addCategory('admin', 'action')).rejects.toMatchObject({ statusCode: 409 });
    prisma.category.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(category.getAllCategories()).resolves.toEqual({ categories: [{ id: 1 }] });
    prisma.category.findUnique.mockResolvedValue({ id: 1 });
    prisma.category.update.mockResolvedValue({ id: 1, name: 'drama' });
    await expect(category.editCategory(1, 'admin', ' Drama ')).resolves.toEqual({ category: { id: 1, name: 'drama' } });
    prisma.category.delete.mockResolvedValue(undefined);
    await expect(category.removeCategory(1, 'admin')).resolves.toEqual({ message: 'Category deleted successfully' });

    prisma.tag.create.mockResolvedValue({ id: 2, name: 'magic' });
    await expect(tag.addTag('admin', ' Magic ')).resolves.toEqual({ tag: { id: 2, name: 'magic' } });
    await expect(tag.addTag('admin', '')).rejects.toMatchObject({ statusCode: 400 });
    prisma.tag.findMany.mockResolvedValue([{ id: 2 }]);
    await expect(tag.getAllTags()).resolves.toEqual({ tags: [{ id: 2 }] });
    prisma.tag.findUnique.mockResolvedValue({ id: 2 });
    prisma.tag.update.mockResolvedValue({ id: 2, name: 'mystery' });
    await expect(tag.editTag(2, 'admin', ' Mystery ')).resolves.toEqual({ tag: { id: 2, name: 'mystery' } });
    prisma.tag.delete.mockResolvedValue(undefined);
    await expect(tag.removeTag(2, 'admin')).resolves.toEqual({ message: 'Tag deleted successfully' });
});

test('notifications list, mark owned records, ignore foreign records, and notify followers', async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(notification.getMyNotifications(4)).resolves.toEqual([{ id: 1 }]);
    prisma.notification.findUnique.mockResolvedValue(null);
    await expect(notification.markAsRead(1, 4)).resolves.toBeNull();
    prisma.notification.findUnique.mockResolvedValue({ id: 1, userId: 4 });
    prisma.notification.update.mockResolvedValue({ id: 1, isRead: true });
    await expect(notification.markAsRead(1, 4)).resolves.toEqual({ id: 1, isRead: true });
    const tx = { followComic: { findMany: jest.fn() }, notification: { createMany: jest.fn() } };
    tx.followComic.findMany.mockResolvedValue([]);
    await expect(notification.notifyFollowersOfNewChapter(3, 'Comic', 'Chapter 1', tx)).resolves.toBeUndefined();
    tx.followComic.findMany.mockResolvedValue([{ userId: 4 }, { userId: 5 }]);
    await notification.notifyFollowersOfNewChapter(3, 'Comic', 'Chapter 1', tx);
    expect(tx.notification.createMany).toHaveBeenCalledWith({ data: expect.arrayContaining([
        expect.objectContaining({ userId: 4, relatedComicId: 3 }),
        expect.objectContaining({ userId: 5, relatedComicId: 3 }),
    ]) });
});