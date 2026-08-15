const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const getMyFollowed = async(userId)=>{
    return prisma.followComic.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            comic: { select: { id: true, title: true, coverImage: true, chapterCount: true } }
        }
    });
}

const followComic = async(comicId,userId)=>{
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });
    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    try {
        return await prisma.followComic.create({ data: { userId, comicId } });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('Already following', 409);
        }
        throw err;
    }
}

const unFollowComic = async(comicId,userId)=>{
    const existing = await prisma.followComic.findUnique({
        where: { userId_comicId: { userId, comicId } }
    });
    if (!existing) {
        throw new AppError('Follow not found', 404);
    }

    await prisma.followComic.delete({
        where: { userId_comicId: { userId, comicId } }
    });

    return { message: 'Unfollowed' };
}

module.exports = {
    getMyFollowed,
    followComic,
    unFollowComic
}