const prisma = require('../../configs/db');

const getMyNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

const markAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

    if (!notification || notification.userId !== userId) {
        return null;   // silently no-op if not found/not theirs — reading someone else's notification isn't a security issue worth a 403, just quietly ignore
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};

// Internal only — called from Chapter's addChapter after a chapter is successfully created.
const notifyFollowersOfNewChapter = async (comicId, comicTitle, chapterTitle, tx = prisma) => {
    const followers = await tx.followComic.findMany({
        where: { comicId },
        select: { userId: true }
    });

    if (followers.length === 0) return;

    await tx.notification.createMany({
        data: followers.map((f) => ({
            userId: f.userId,
            type: 'NEW_CHAPTER',
            message: `${comicTitle} has a new chapter: ${chapterTitle}`,
            relatedComicId: comicId
        }))
    });
};

module.exports = {
    getMyNotifications,
    markAsRead,
    notifyFollowersOfNewChapter
};