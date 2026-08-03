const AppError = require('../../utils/AppError')
const prisma = require('../../configs/db');
const {formatChapterContent} = require('./chapter.model')

const getChaptersByComicId = async(comicId)=>{
    if (!comicId || Number.isNaN(comicId)) {
        throw new AppError('comicId is required', 400);
    }
    
    const chapters = await prisma.chapter.findMany({
        where: { comicId },
        select: {
            id: true,
            chapterNumber: true,
            title: true,
            coinCost: true,
            viewCount: true,
            createdAt: true
        },
        orderBy: { chapterNumber: 'asc' }
    });
    return chapters;
}

const getChapterById = async(chapterId)=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: {
            id: true,
            comicId: true,
            chapterNumber: true,
            title: true,
            coinCost: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true
        }
    });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    return chapter;
}

const getChapterContent = async(chapterId,userId,userRole)=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            comic: { select: { creatorId: true } },
            pages: { orderBy: { pageNumber: 'asc' } }
        }
    });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    const isFree = chapter.coinCost === 0;
 
    if (isFree) {
        return formatChapterContent(chapter);
    }
 
    if (!userId) {
        throw new AppError('Please log in to view this chapter', 401);
    }
 
    const isOwner = chapter.comic.creatorId === userId || userRole === 'admin';
 
    if (!isOwner) {
        const hasUnlocked = await prisma.chapterUnlock.findFirst({
            where: { chapterId, userId }
        });
 
        if (!hasUnlocked) {
            throw new AppError('You have not unlocked this chapter', 403);
        }
    }
 
    return formatChapterContent(chapter);
}

const addChapter = async(userId,userRole,{comicId,chapterNumber,title,coinCost})=>{
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });
 
    if (!comic) {
        throw new AppError('Comic not found', 404);
    }
 
    if (comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to add a chapter to this comic', 403);
    }
 
    try {
        return await prisma.chapter.create({
            data: {
                comicId,
                chapterNumber,
                title,
                coinCost: coinCost ?? 0
            }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('Chapter number already exists for this comic', 409);
        }
        throw err;
    }
}

const editChapter = async(chapterId,userId,userRole,{chapterNumber,title,coinCost})=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { comic: { select: { creatorId: true } } }
    });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    if (chapter.comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to edit this chapter', 403);
    }
 
    try {
        return await prisma.chapter.update({
            where: { id: chapterId },
            data: { chapterNumber, title, coinCost }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('Chapter number already exists for this comic', 409);
        }
        throw err;
    }
}

const removeChapter = async(chapterId,userId,userRole)=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { comic: { select: { creatorId: true } } }
    });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    if (chapter.comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to delete this chapter', 403);
    }
 
    await prisma.chapter.delete({ where: { id: chapterId } });
    return { message: 'Chapter deleted successfully' };
}

const unlockChapter = async(chapterId,userId)=>{
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    if (chapter.coinCost === 0) {
        throw new AppError('This chapter is free and does not need to be unlocked', 400);
    }
 
    const alreadyUnlocked = await prisma.chapterUnlock.findFirst({
        where: { chapterId, userId }
    });
 
    if (alreadyUnlocked) {
        throw new AppError('You have already unlocked this chapter', 409);
    }
    
    return prisma.$transaction(async (tx) => {
        const wallet = await tx.coinWallet.findUnique({ where: { userId } });
 
        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }
 
        if (wallet.balance < chapter.coinCost) {
            throw new AppError('Not enough coins', 402);
        }
 
        await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: chapter.coinCost } }
        });
 
        const unlock = await tx.chapterUnlock.create({
            data: { chapterId, userId }
        });
 
        return unlock;
    });
}

module.exports = {
    getChaptersByComicId,
    getChapterById,
    getChapterContent,
    addChapter,
    editChapter,
    removeChapter,
    unlockChapter
};