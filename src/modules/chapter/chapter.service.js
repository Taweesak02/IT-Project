const AppError = require('../../utils/AppError')
const prisma = require('../../configs/db');
const { deleteFileByUrl } = require('../upload/upload.service');
const {formatChapterContent} = require('./chapter.model')
const {incrementChapterCount,decreaseChapterCount} = require('../comicManagement/comicManagement.service')
const {upsertReadHistory} = require('../history/history.service')
const { notifyFollowersOfNewChapter } = require('../notification/notification.service');
const { decreaseWallet } = require('../wallet/wallet.service');

// แสดง ตอน ด้วย ComicId
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
    
    if(chapters.length == 0){
        return {message:"No chapter in this comic"}
    }

    return chapters;
}

// แสดง ตอน ด้วย chapterId
const getChapterById = async(chapterId)=>{
    if (!chapterId || Number.isNaN(chapterId)) {
        throw new AppError('chapterId is required', 400);
    }

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

const getUnlockedChapters = async(userId, comicId)=>{
    if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new AppError('Invalid user', 401);
    }
    if (comicId !== undefined && (!Number.isSafeInteger(comicId) || comicId <= 0)) {
        throw new AppError('comicId must be a positive integer', 400);
    }

    return prisma.chapter.findMany({
        where: {
            unlocks: { some: { userId } },
            ...(comicId !== undefined ? { comicId } : {})
        },
        select: {
            id: true,
            comicId: true,
            chapterNumber: true,
            title: true,
            coinCost: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: [{ comicId: 'asc' }, { chapterNumber: 'asc' }]
    });
};

// ดูเนื้อหาด้านใน รูปภาพต่างๆ จาก ตอนนั้นๆ
const getChapterContent = async(chapterId,userId,userRole)=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            comic: { select: { id: true, creatorId: true } },
            pages: { orderBy: { pageNumber: 'asc' } }
        }
    });
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    const isFree = chapter.coinCost === 0;
    const isOwner = chapter.comic.creatorId === userId || userRole === 'admin';

    if (!isFree && !isOwner) {
        if (!userId) {
            throw new AppError('Please log in to view this chapter', 401);
        }

        
        
        const hasUnlocked = await prisma.chapterUnlock.findFirst({
            where: { chapterId, userId }
        });

        if (!hasUnlocked) {
            throw new AppError('You have not unlocked this chapter', 403);
        }
    }

    // ถ้าเป็นเจ้าของหรือ admin จะไม่เพิ่มยอดวิว และ บันทึกประวัติการดู
    if (!isOwner) {
        await prisma.$transaction(async (tx) => {
            await tx.chapter.update({
                where: { id: chapterId },
                data: { viewCount: { increment: 1 } }
            });
            await tx.comic.update({
                where: { id: chapter.comic.id },
                data: { viewCount: { increment: 1 } }
            });

            // only track read history for logged-in users — anonymous readers have no userId to attach it to
            if (userId) {
                await upsertReadHistory(userId, chapterId, tx);
            }
        });
    }

    return formatChapterContent(chapter);
}

// เพิ่ม ตอน ใน comic
const addChapter = async(userId,userRole,{comicId,chapterNumber,title,coinCost,pages})=>{
    if (!pages || pages.length === 0) {
        throw new AppError('At least one page is required', 400);
    }
    
    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found', 404);
    }
 
    if (comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to add a chapter to this comic', 403);
    }
 
    try {
        const createdChapter = await prisma.$transaction(async(tx)=>{
            const chapter = await tx.chapter.create({
                data: {
                    comicId,
                    chapterNumber,
                    title,
                    coinCost: coinCost ?? 0,
                    pages: {
                        create: pages.map((url, index) => ({
                            imageUrl: url,
                            pageNumber: index + 1
                        }))
                    }
                },
                include: { pages: true }
            });
            await incrementChapterCount(comicId,tx);
            await notifyFollowersOfNewChapter(comicId, comic.title, chapter.title, tx);
            return chapter;
        })
        return createdChapter
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('Chapter number already exists for this comic', 409);
        }
        throw err;
    }
}

// แก้ไขรายละเอียดของ ตอน (ไม่ใช่รูปภาพ)
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

// ลบ ตอน จะลบทั้งตอน และรูปภาพ
const removeChapter = async(chapterId,userId,userRole)=>{
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            comic: { select: { creatorId: true } },
            pages:true
        }
    });
 
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }
 
    if (chapter.comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to delete this chapter', 403);
    }
 
    await prisma.$transaction(async (tx) => {
        await tx.chapter.delete({ where: { id: chapterId } });
        await decreaseChapterCount(chapter.comicId, tx);
    });

    for (const page of chapter.pages) {
        await deleteFileByUrl(page.imageUrl);   // adjust field name to match your ChapterImage model
    }
  
    return { message: 'Chapter deleted successfully' };
}

//ปลดล็อก ตอน
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
 
        await decreaseWallet(wallet.id, chapter.coinCost, tx);
 
        const unlock = await tx.chapterUnlock.create({
            data: {
                chapterId,userId 
            }
        });
 
        return unlock;
    });
}

// แก้ไข รูปภาพในตอน
const replaceChapterPages = async (chapterId, userId, userRole, pages) => {
    if (!pages || pages.length === 0) {
        throw new AppError('At least one page is required', 400);
    }

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            comic: { select: { creatorId: true } },
            pages: true
        }
    });

    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }

    if (chapter.comic.creatorId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to edit this chapter', 403);
    }

    const oldPages = chapter.pages;

    const updatedChapter = await prisma.chapter.update({
        where: { id: chapterId },
        data: {
            pages: {
                deleteMany: {},                                  // remove all old ChapterImage rows
                create: pages.map((url, index) => ({
                    imageUrl: url,
                    pageNumber: index + 1
                }))
            }
        },
        include: { pages: true }
    });

    for (const page of oldPages) {
        await deleteFileByUrl(page.imageUrl);   // clean up old files from disk after DB update succeeds
    }

    return updatedChapter;
};

module.exports = {
    getChaptersByComicId,
    getUnlockedChapters,
    getChapterById,
    getChapterContent,
    addChapter,
    editChapter,
    removeChapter,
    unlockChapter,
    replaceChapterPages
};
