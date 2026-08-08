const AppError = require('../../utils/AppError')
const prisma = require('../../configs/db');

const ALLOWED_SORTS = {
    latest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    popular: { viewCount: 'desc' },
    title: { title: 'asc' }
};


const searchComic = async({title,tags,categorys,sort,page,limit})=>{
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 20;
 
    const where = {
        approved: true,
        ...(title && {
            title: { contains: title, mode: 'insensitive' }
        }),
        ...(tags?.length && {
            tags: { some: { tagId: { in: tags.map(Number) } } }
        }),
        ...(categorys?.length && {
            categories: { some: { categoryId: { in: categorys.map(Number) } } }
        })
    };
 
    const orderBy = ALLOWED_SORTS[sort] ?? ALLOWED_SORTS.latest;
 
    const [comics, total] = await prisma.$transaction([
        prisma.comic.findMany({
            where,
            orderBy,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                title: true,
                coverImage: true,
                status: true,
                viewCount: true,
                chapterCount: true,
                createdAt: true,
                categories: { select: { category: { select: { id: true, name: true } } } },
                tags: { select: { tag: { select: { id: true, name: true } } } }
            }
        }),
        prisma.comic.count({ where })
    ]);
 
    return {
        comics,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

const getPopularComics = async (limit = 10) => {
    return prisma.comic.findMany({
        where: { approved: true },
        orderBy: { viewCount: 'desc' },
        take: limit,
        select: {
            id: true, title: true, coverImage: true, viewCount: true
        }
    });
};

const getTopRatedComics = async (limit = 10) => {
      return prisma.comic.findMany({
        where: { approved: true, ratingCount: { gt: 0 } },
        orderBy: { avgRating: 'desc' },
        take: limit,
        select: { id: true, title: true, coverImage: true, avgRating: true, ratingCount: true }
    });
}

const getMostFollowedComics = async (limit = 10) => {
    return prisma.comic.findMany({
        where: { approved: true },
        orderBy: { follows: { _count: 'desc' } },
        take: limit,
        select: {
            id: true, title: true, coverImage: true,
            _count: { select: { follows: true } }
        }
    });
};

const searchComicDetail = async(comicId)=>{
    if (!comicId || Number.isNaN(comicId)) {
        throw new AppError('comicId is required', 400);
    }
 
    const comic = await prisma.comic.findFirst({
        where: { id: comicId, approved: true },
        select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            status: true,
            viewCount: true,
            chapterCount: true,
            createdAt: true,
            creator: { select: { id: true, username: true } },
            categories: { select: { category: { select: { id: true, name: true } } } },
            tags: { select: { tag: { select: { id: true, name: true } } } },
            chapters: {
                orderBy: { chapterNumber: 'asc' },
                select: {
                    id: true,
                    chapterNumber: true,
                    title: true,
                    coinCost: true,
                    viewCount: true,
                    createdAt: true
                }
            },
            _count: {
                select: { ratings: true, favorites: true, follows: true }
            }
        }
    });
 
    if (!comic) {
        throw new AppError('Comic not found', 404);
    }
 
    const ratingStats = await prisma.comicRating.aggregate({
        where: { comicId },
        _avg: { rating: true }
    });
 
    return {
        ...comic,
        avgRating: ratingStats._avg.rating ?? 0
    };
}

module.exports = {
    searchComic,
    getPopularComics,
    getTopRatedComics,
    getMostFollowedComics,
    searchComicDetail
}