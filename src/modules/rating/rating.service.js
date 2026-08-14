const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const getComicRatings = async(comicId)=>{
    if (!comicId || Number.isNaN(comicId)) {
        throw new AppError('comicId is required', 400);
    }

    const comic = await prisma.comic.findUnique({
        where: { id: comicId },
        select: { avgRating: true, ratingCount: true }
    });

    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    const ratings = await prisma.comicRating.findMany({
        where: { comicId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            rating: true,
            createdAt: true,
            user: { select: { id: true, username: true } }
        }
    });

    return {
        avgRating: comic.avgRating,
        ratingCount: comic.ratingCount,
        ratings
    };
}

const getMyRating = async(comicId,userId)=>{
    if (!comicId || Number.isNaN(comicId)) {
        throw new AppError('comicId is required', 400);
    }

    const rating = await prisma.comicRating.findUnique({
        where: { userId_comicId: { userId, comicId } }
    });

    return rating ?? null;
}

const rateComic = async(comicId, userId, rating)=>{
     if (!rating || rating < 1 || rating > 5) {
        throw new AppError('rating must be between 1 and 5', 400);
    }

    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    return prisma.$transaction(async (tx) => {
        const result = await tx.comicRating.upsert({
            where: { userId_comicId: { userId, comicId } },
            update: { rating },
            create: { userId, comicId, rating }
        });

        await recalculateComicRating(comicId, tx);

        return result;
    });
}

const removeRating = async(comicId,userId)=>{
    const existing = await prisma.comicRating.findUnique({
        where: { userId_comicId: { userId, comicId } }
    });

    if (!existing) {
        throw new AppError('Rating not found', 404);
    }

    return prisma.$transaction(async (tx) => {
        await tx.comicRating.delete({
            where: { userId_comicId: { userId, comicId } }
        });

        await recalculateComicRating(comicId, tx);

        return { message: 'Rating removed successfully' };
    });
}

const recalculateComicRating = async (comicId, tx = prisma) => {
    const stats = await tx.comicRating.aggregate({
        where: { comicId },
        _avg: { rating: true },
        _count: { rating: true }
    });

    await tx.comic.update({
        where: { id: comicId },
        data: {
            avgRating: stats._avg.rating ?? 0,
            ratingCount: stats._count.rating
        }
    });
};

module.exports = {
    getComicRatings,
    getMyRating,
    rateComic,
    removeRating
}