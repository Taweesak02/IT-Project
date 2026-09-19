const prisma = require('../../configs/db');
const { deleteFileByUrl } = require('../upload/upload.service');
const AppError = require('../../utils/AppError');

const addComic = async (creatorId,{ title, description, coverImage, categoryIds, tagIds })=>{
    const createComic = await prisma.comic.create({
        data: {
            title: title,
            description: description,
            coverImage: coverImage,
            creatorId: creatorId,              // direct scalar — simple foreign key
            categories: {
                create: (categoryIds ?? []).map(id => ({
                    category: { connect: { id } }        // nested write + connect for many-to-many
                }))
            },
            tags: {
                create: (tagIds ?? []).map(id => ({
                    tag: { connect: { id } }
                }))
            }
        },
        include: {
            categories: { include: { category: true } },
            tags: { include: { tag: true } }
        }
    })
    return createComic;
}

const editComic = async(comicId,userId,role,{ title, description, coverImage, status, categoryIds, tagIds })=>{
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found',404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to edit this comic',403);
    }

    if (coverImage && comic.coverImage && coverImage !== comic.coverImage) {
        await deleteFileByUrl(comic.coverImage);
    }

    const updateData = { title, description, coverImage, status };

    // only touch categories/tags if the client actually sent them
    if (categoryIds) {
        updateData.categories = {
            deleteMany: {},                                        // clear old links
            create: categoryIds.map(id => ({ category: { connect: { id } } }))
        };
    }
    if (tagIds) {
        updateData.tags = {
            deleteMany: {},
            create: tagIds.map(id => ({ tag: { connect: { id } } }))
        };
    }

    const updatedComic = await prisma.comic.update({
        where: { id: comicId },
        data: updateData,
        include: {
            categories: { include: { category: true } },
            tags: { include: { tag: true } }
        }
    });

    return updatedComic;
}

const removeComic = async(comicId, userId, role)=>{
    const comic = await prisma.comic.findUnique({
        where: { id: comicId },
        include: { chapters: { include: { pages: true } } }
    });

    if (!comic) {
        throw new AppError('Comic not found',404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to delete this comic',403);
    }

    await prisma.comic.update({
        where: { id: comicId },
        data: { isActive: false }
    });

    return { message: 'Comic deactivated successfully' };
}

const resubmitComic = async(comicId, userId, role)=>{
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to resubmit this comic', 403);
    }

    return prisma.comic.update({
        where: { id: comicId },
        data: {
            approved: 'RESUBMIT',
            resubmitAt: new Date()
        },
        select: {
            id: true,
            title: true,
            approved: true,
            resubmitAt: true
        }
    });
}

const getComicById = async(comicId, userId, role)=>{
    const comic = await prisma.comic.findUnique({
        where: { id: comicId },
        include: {
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
            chapters: true
        }
    });

    if (!comic) {
        throw new AppError('Comic not found',404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to view this comic',403);
    }

    return comic;
}

const getComicByCreator = async(creatorId)=>{
    return prisma.comic.findMany({
        where: { creatorId },
        include: {
            categories: { include: { category: true } },
            tags: { include: { tag: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

const getComicOverview = async(creatorId)=>{
    const comics = await prisma.comic.findMany({
        where: { creatorId },
        select: {
            chapterCount: true,
            viewCount: true,
            ratingCount: true,
            avgRating: true,
            _count: {
                select: {
                    favorites: true,
                    follows: true
                }
            }
        }
    });

    const overview = comics.reduce((overview, comic) => ({
        totalComics: overview.totalComics + 1,
        totalChapters: overview.totalChapters + comic.chapterCount,
        totalViews: overview.totalViews + comic.viewCount,
        totalRatings: overview.totalRatings + comic.ratingCount,
        totalFavorites: overview.totalFavorites + comic._count.favorites,
        totalFollowers: overview.totalFollowers + comic._count.follows,
        totalRatingScore: overview.totalRatingScore + (comic.avgRating * comic.ratingCount)
    }), {
        totalComics: 0,
        totalChapters: 0,
        totalViews: 0,
        totalRatings: 0,
        totalFavorites: 0,
        totalFollowers: 0,
        totalRatingScore: 0
    });

    return {
        totalComics: overview.totalComics,
        totalChapters: overview.totalChapters,
        totalViews: overview.totalViews,
        totalRatings: overview.totalRatings,
        totalFavorites: overview.totalFavorites,
        totalFollowers: overview.totalFollowers,
        averageRating: overview.totalRatings === 0 ? 0 : overview.totalRatingScore / overview.totalRatings
    };
}

const getComicStatistic = async(comicId, userId, role)=>{
    const comic = await prisma.comic.findUnique({
        where: { id: comicId },
        select: {
            id: true,
            title: true,
            viewCount: true,
            creatorId: true,
            _count: {
                select: {
                    ratings: true,
                    favorites: true,
                    follows: true,
                    chapters: true
                }
            }
        }
    });

    if (!comic) {
        throw new AppError('Comic not found',404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to view this statistic',403);
    }

    return comic;
}

const incrementChapterCount = async(comicId,tx=prisma)=>{
    await tx.comic.update({
        where: {id:comicId},
        data:{
            chapterCount:{
                increment: 1
            }
        }
    })
}

const decreaseChapterCount = async(comicId,tx=prisma)=>{
    await tx.comic.update({
        where: {id:comicId},
        data:{
            chapterCount: {
                decrement: 1 
            }
        }
    })
}

module.exports = {
    addComic,
    editComic,
    removeComic,
    resubmitComic,
    getComicById,
    getComicByCreator,
    getComicOverview,
    getComicStatistic,
    incrementChapterCount,
    decreaseChapterCount
};