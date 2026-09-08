const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const { isAdmin } = require('../../utils/checkUtil');

const getAllStatistic = async (userRole) => {
    isAdmin(userRole);

    // const [userCount, comicCount, chapterCount, totalRevenue] = await prisma.$transaction([
    //     prisma.user.count({ where: { status: 'active' } }),
    //     prisma.comic.count({ where: { approved: true } }),
    //     prisma.chapter.count(),
    //     prisma.paymentTransaction.aggregate({
    //         where: { paymentStatus: 'COMPLETED' },
    //         _sum: { amount: true }
    //     })
    // ]);

    // return {
    //     userCount,
    //     comicCount,
    //     chapterCount,
    //     totalRevenue: totalRevenue._sum.amount ?? 0
    // };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [
        totalUsers,
        activeUsers,
        bannedUsers,
        newUsersToday,
        totalComics,
        totalChapters,
        totalRatings,
        totalComments,
        totalFavorites,
        totalFollows,
        revenueStats,
        pendingPayments,
        failedPayments,
        coinsSpent,
        viewSum
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.user.count({ where: { status: 'banned' } }),
        prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.comic.count({ where: { approved: true } }),
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
        prisma.coinTransaction.aggregate({
            where: { transactionType: 'SPEND' },
            _sum: { coinAmount: true }
        }),
        prisma.comic.aggregate({ _sum: { viewCount: true } })
    ]);

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            banned: bannedUsers,
            newToday: newUsersToday
        },
        content: {
            totalComics,
            totalChapters
        },
        engagement: {
            totalViews: viewSum._sum.viewCount ?? 0,
            totalRatings,
            totalComments,
            totalFavorites,
            totalFollows
        },
        commerce: {
            totalRevenue: revenueStats._sum.amount ?? 0,
            totalCompletedPayments: revenueStats._count,
            pendingPayments,
            failedPayments,
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

const getTransactions = async (userRole, page, limit, status ) => {
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

module.exports = {
    getAllStatistic,
    banUser,
    unbanUser,
    getTransactions
}