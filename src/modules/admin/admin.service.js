const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const { isAdmin } = require('../../utils/checkUtil');

const getAllStatistic = async (userRole) => {
    isAdmin(userRole);
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        totalUsers,
        activeUsers,
        bannedUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        allComics,
        totalComics,
        unapprovedComics,
        resubmitComics,
        inactiveComics,
        ongoingComics,
        completedComics,
        hiatusComics,
        cancelledComics,
        totalChapters,
        totalRatings,
        totalComments,
        totalFavorites,
        totalFollows,
        revenueStats,
        pendingPayments,
        failedPayments,
        refundedPayments,
        coinsSpent,
        viewSum,
        viewsToday,
        viewsThisWeek,
        revenueToday,
        revenueThisMonth,
        refundedRevenue,
        topComicsByViews
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'banned' } }),
        prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.comic.count(),
        prisma.comic.count({ where: { approved: 'APPROVED' } }),
        prisma.comic.count({ where: { approved: 'UNAPPROVED' } }),
        prisma.comic.count({ where: { approved: 'RESUBMIT' } }),
        prisma.comic.count({ where: { isActive: false } }),
        prisma.comic.count({ where: { status: 'ONGOING' } }),
        prisma.comic.count({ where: { status: 'COMPLETED' } }),
        prisma.comic.count({ where: { status: 'HIATUS' } }),
        prisma.comic.count({ where: { status: 'CANCELLED' } }),
        prisma.chapter.count(),
        prisma.comicRating.count(),
        prisma.comment.count(),
        prisma.favoriteComic.count(),
        prisma.followComic.count(),
        prisma.paymentTransaction.aggregate({
            where: { paymentStatus: 'COMPLETED' },
            _sum: { amount: true },
            _count: true
        }),
        prisma.paymentTransaction.count({ where: { paymentStatus: 'PENDING' } }),
        prisma.paymentTransaction.count({ where: { paymentStatus: 'FAILED' } }),
        prisma.paymentTransaction.count({ where: { paymentStatus: 'REFUNDED' } }),
        prisma.coinTransaction.aggregate({
            where: { transactionType: 'SPEND' },
            _sum: { coinAmount: true }
        }),
        prisma.comic.aggregate({ _sum: { viewCount: true } }),
        prisma.viewStatistic.aggregate({
            where: { viewDate: { gte: startOfToday } },
            _sum: { viewsCount: true }
        }),
        prisma.viewStatistic.aggregate({
            where: { viewDate: { gte: startOfWeek } },
            _sum: { viewsCount: true }
        }),
        prisma.paymentTransaction.aggregate({
            where: {
                paymentStatus: 'COMPLETED',
                createdAt: { gte: startOfToday }
            },
            _sum: { amount: true }
        }),
        prisma.paymentTransaction.aggregate({
            where: {
                paymentStatus: 'COMPLETED',
                createdAt: { gte: startOfMonth }
            },
            _sum: { amount: true }
        }),
        prisma.paymentTransaction.aggregate({
            where: { paymentStatus: 'REFUNDED' },
            _sum: { amount: true }
        }),
        prisma.comic.findMany({
            orderBy: [{ viewCount: 'desc' }, { id: 'asc' }],
            take: 5,
            select: {
                id: true,
                title: true,
                viewCount: true,
                approved: true,
                isActive: true
            }
        })
    ]);

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            banned: bannedUsers,
            newToday: newUsersToday,
            newThisWeek: newUsersThisWeek,
            newThisMonth: newUsersThisMonth
        },
        content: {
            totalAll: allComics,
            totalComics,
            approved: totalComics,
            unapproved: unapprovedComics,
            resubmit: resubmitComics,
            inactive: inactiveComics,
            byStatus: {
                ongoing: ongoingComics,
                completed: completedComics,
                hiatus: hiatusComics,
                cancelled: cancelledComics
            },
            totalChapters
        },
        engagement: {
            totalViews: viewSum._sum.viewCount ?? 0,
            viewsToday: viewsToday._sum.viewsCount ?? 0,
            viewsThisWeek: viewsThisWeek._sum.viewsCount ?? 0,
            totalRatings,
            totalComments,
            totalFavorites,
            totalFollows,
            topComicsByViews
        },
        commerce: {
            totalRevenue: revenueStats._sum.amount ?? 0,
            totalCompletedPayments: revenueStats._count,
            pendingPayments,
            failedPayments,
            refundedPayments,
            revenueToday: revenueToday._sum.amount ?? 0,
            revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
            refundedRevenue: refundedRevenue._sum.amount ?? 0,
            totalCoinsSpent: coinsSpent._sum.coinAmount ?? 0
        }
    };
};

const banUser = async (userRole, targetUserId) => {
    isAdmin(userRole);

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return prisma.$transaction(async (tx) => {
        await tx.refreshToken.updateMany({
            where: { userId: targetUserId },
            data: { revoked: true }
        });

        return tx.user.update({
            where: { id: targetUserId },
            data: { status: 'banned' }
        });
    });
};

const unbanUser = async (userRole, targetUserId) => {
    isAdmin(userRole);

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return prisma.user.update({
        where: { id: targetUserId },
        data: { status: 'active' }
    });
};

const getTransactions = async (userRole, page, limit, status) => {
    isAdmin(userRole);

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 20;
    const where = status ? { paymentStatus: status } : {};

    const [transactions, total] = await prisma.$transaction([
        prisma.paymentTransaction.findMany({
            where,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, email: true } },
                coinPackage: { select: { name: true, coinAmount: true } },
                paymentMethod: { select: { name: true } }
            }
        }),
        prisma.paymentTransaction.count({ where })
    ]);

    return {
        transactions,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
};

const setComicApproval = async (userRole, comicId, approved) => {
    isAdmin(userRole);

    const comic = await prisma.comic.findUnique({ where: { id: comicId } });

    if (!comic) {
        throw new AppError('Comic not found', 404);
    }

    return prisma.comic.update({
        where: { id: comicId },
        data: {
            approved,
            resubmitAt: null
        },
        select: {
            id: true,
            title: true,
            approved: true,
            resubmitAt: true,
            isActive: true
        }
    });
};

const searchAdminComics = async (userRole, { title, approved, page = 1, limit = 20 } = {}) => {
    isAdmin(userRole);

    const currentPage = Number(page);
    const pageSize = Number(limit);
    if (!Number.isSafeInteger(currentPage) || currentPage < 1 ||
        !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
        !Number.isSafeInteger((currentPage - 1) * pageSize)) {
        throw new AppError('Invalid pagination: page must be positive and limit must be between 1 and 100', 400);
    }
    if (title !== undefined && typeof title !== 'string') {
        throw new AppError('title must be a string', 400);
    }
    if (approved !== undefined && !['APPROVED', 'UNAPPROVED', 'RESUBMIT'].includes(approved)) {
        throw new AppError('Invalid approval status', 400);
    }
    const keyword = (title ?? '').trim();
    const where = { ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }), ...(approved && { approved }) };
    const [comics, total] = await prisma.$transaction([
        prisma.comic.findMany({
            where,
            orderBy: [{ title: 'asc' }, { id: 'asc' }],
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            select: { id: true, title: true, approved: true, isActive: true }
        }),
        prisma.comic.count({ where })
    ]);
    return {
        comics,
        pagination: { page: currentPage, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
};

module.exports = {
    searchAdminComics,
    getAllStatistic,
    banUser,
    unbanUser,
    getTransactions,
    setComicApproval
};