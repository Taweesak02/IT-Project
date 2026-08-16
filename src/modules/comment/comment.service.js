const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const getCommentsByChapter = async (chapterId) => {
    if (!chapterId || Number.isNaN(chapterId)) {
        throw new AppError('chapterId is required', 400);
    }

    return prisma.comment.findMany({
        where: { chapterId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, username: true, profileImage: true } }
        }
    });
};

const addComment = async (chapterId, userId, content) => {
    if (!content || !content.trim()) {
        throw new AppError('content is required', 400);
    }

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
        throw new AppError('Chapter not found', 404);
    }

    return prisma.comment.create({
        data: { userId, chapterId, content: content.trim() }
    });
};

const editComment = async (commentId, userId, userRole, content) => {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to edit this comment', 403);
    }

    if (!content || !content.trim()) {
        throw new AppError('content is required', 400);
    }

    return prisma.comment.update({
        where: { id: commentId },
        data: { content: content.trim() }
    });
};

const removeComment = async (commentId, userId, userRole) => {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to delete this comment', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
};

module.exports = {
    getCommentsByChapter,
    addComment,
    editComment,
    removeComment
}