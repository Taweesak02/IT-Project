jest.mock('../src/configs/db', () => ({
    comic: {
        findMany: jest.fn(),
        count: jest.fn()
    },
    chapter: { count: jest.fn() },
    viewStatistic: { aggregate: jest.fn() },
    followComic: { count: jest.fn() },
    favoriteComic: { count: jest.fn() },
    $transaction: jest.fn(async (queries) => Promise.all(queries))
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
    prisma.comic.count.mockResolvedValue(0);
    prisma.chapter.count.mockResolvedValue(0);
    prisma.viewStatistic.aggregate.mockResolvedValue({ _sum: { viewsCount: null } });
    prisma.followComic.count.mockResolvedValue(0);
    prisma.favoriteComic.count.mockResolvedValue(0);

    await expect(getComicOverview(12)).resolves.toEqual({
        totalComics: 2,
        totalChapters: 10,
        totalViews: 350,
        totalRatings: 5,
        totalFavorites: 9,
        totalFollowers: 14,
        averageRating: 2.8,
        approval: {
            approved: 0,
            unapproved: 0,
            resubmit: 0,
            inactive: 0
        },
        status: {
            ongoing: 0,
            completed: 0,
            hiatus: 0,
            cancelled: 0
        },
        period: {
            newChaptersThisWeek: 0,
            viewsThisWeek: 0,
            viewsThisMonth: 0,
            newFollowersThisWeek: 0,
            newFavoritesThisWeek: 0
        },
        topComicsByViews: [
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
        ]
    });

    expect(prisma.comic.findMany).toHaveBeenCalledWith({
        where: { creatorId: 12 },
        select: expect.any(Object)
    });
});

test('returns zeroed statistics when the creator has no comics', async () => {
    prisma.comic.findMany.mockResolvedValue([]);
    prisma.comic.count.mockResolvedValue(0);
    prisma.chapter.count.mockResolvedValue(0);
    prisma.viewStatistic.aggregate.mockResolvedValue({ _sum: { viewsCount: null } });
    prisma.followComic.count.mockResolvedValue(0);
    prisma.favoriteComic.count.mockResolvedValue(0);

    await expect(getComicOverview(12)).resolves.toEqual({
        totalComics: 0,
        totalChapters: 0,
        totalViews: 0,
        totalRatings: 0,
        totalFavorites: 0,
        totalFollowers: 0,
        averageRating: 0,
        approval: {
            approved: 0,
            unapproved: 0,
            resubmit: 0,
            inactive: 0
        },
        status: {
            ongoing: 0,
            completed: 0,
            hiatus: 0,
            cancelled: 0
        },
        period: {
            newChaptersThisWeek: 0,
            viewsThisWeek: 0,
            viewsThisMonth: 0,
            newFollowersThisWeek: 0,
            newFavoritesThisWeek: 0
        },
        topComicsByViews: []
    });
});