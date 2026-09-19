jest.mock('../src/configs/db', () => ({
    comic: { findMany: jest.fn() }
}));

const prisma = require('../src/configs/db');
const { getComicOverview } = require('../src/modules/comicManagement/comicManagement.service');

beforeEach(() => jest.clearAllMocks());

test('aggregates statistics for comics owned by the creator', async () => {
    prisma.comic.findMany.mockResolvedValue([
        {
            chapterCount: 3,
            viewCount: 100,
            ratingCount: 2,
            avgRating: 4,
            _count: { favorites: 5, follows: 6 }
        },
        {
            chapterCount: 7,
            viewCount: 250,
            ratingCount: 3,
            avgRating: 2,
            _count: { favorites: 4, follows: 8 }
        }
    ]);

    await expect(getComicOverview(12)).resolves.toEqual({
        totalComics: 2,
        totalChapters: 10,
        totalViews: 350,
        totalRatings: 5,
        totalFavorites: 9,
        totalFollowers: 14,
        averageRating: 2.8
    });

    expect(prisma.comic.findMany).toHaveBeenCalledWith({
        where: { creatorId: 12 },
        select: expect.any(Object)
    });
});

test('returns zeroed statistics when the creator has no comics', async () => {
    prisma.comic.findMany.mockResolvedValue([]);

    await expect(getComicOverview(12)).resolves.toEqual({
        totalComics: 0,
        totalChapters: 0,
        totalViews: 0,
        totalRatings: 0,
        totalFavorites: 0,
        totalFollowers: 0,
        averageRating: 0
    });
});