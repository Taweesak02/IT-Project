const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const getMyFavorites = async (userId) => {
    return prisma.favoriteComic.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            comic: { select: { id: true, title: true, coverImage: true, avgRating: true } }
        }
    });
}

const addFavorite = async (comicId, userId) => {
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    try {
        return await prisma.favoriteComic.create({ data: { userId, comicId } });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('Already favorited', 409);
        }
        throw err;
    }
}

const removeFavorite = async (comicId, userId) => {
    const existing = await prisma.favoriteComic.findUnique({
        where: { userId_comicId: { userId, comicId } }
    });
    if (!existing) {
        throw new AppError('Favorite not found', 404);
    }

    await prisma.favoriteComic.delete({
        where: { userId_comicId: { userId, comicId } }
    });

    return { message: 'Removed from favorites' };
}

module.exports = {
    getMyFavorites,
    addFavorite,
    removeFavorite
}