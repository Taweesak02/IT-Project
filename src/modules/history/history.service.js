const prisma = require('../../configs/db');

const getMyHistory = async (userId) => {
    return prisma.readHistory.findMany({
        where: { userId },
        orderBy: { lastReadAt: 'desc' },
        include: {
            chapter: {
                select: {
                    id: true,
                    title: true,
                    chapterNumber: true,
                    comic: { select: { id: true, title: true, coverImage: true } }
                }
            }
        }
    });
};

const upsertReadHistory = async (userId, chapterId, tx = prisma) => {
    return tx.readHistory.upsert({
        where: { userId_chapterId: { userId, chapterId } },
        update: { lastReadAt: new Date() },
        create: { userId, chapterId }
    });
};

module.exports = {
    getMyHistory,
    upsertReadHistory
}