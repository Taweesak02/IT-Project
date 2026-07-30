const prisma = require('../../configs/db');
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
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found',404);
    }

    if (comic.creatorId !== userId && role !== 'admin') {
        throw new AppError('You do not have permission to delete this comic',403);
    }

    await prisma.comic.delete({ where: { id: comicId } });

    return { message: 'Comic deleted successfully' };
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


module.exports = {
    addComic,
    editComic,
    removeComic,
    getComicById,
    getComicByCreator,
    getComicStatistic
};