const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const { isAdmin } = require('../../utils/checkUtil');

const getAllStatistic = async (userRole) => {
    isAdmin(userRole);

    const [userCount, comicCount, chapterCount, totalRevenue] = await prisma.$transaction([
        prisma.user.count({ where: { status: 'active' } }),
        prisma.comic.count({ where: { approved: true } }),
        prisma.chapter.count(),
        prisma.paymentTransaction.aggregate({
            where: { paymentStatus: 'COMPLETED' },
            _sum: { amount: true }
        })
    ]);

    return {
        userCount,
        comicCount,
        chapterCount,
        totalRevenue: totalRevenue._sum.amount ?? 0
    };
};

const getAllUsers = async (userRole, page, limit, status ) => {
    isAdmin(userRole);

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 20;

    const where = status ? { status } : {};

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                username: true,
                status: true,
                createdAt: true,
                role: { select: { roleName: true } }
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
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

const getDashboard = async (userRole) => {
    isAdmin(userRole);

    const [stats, recentUsers, recentComics, topComics] = await Promise.all([
        getAllStatistic('admin'),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, email: true, createdAt: true }
        }),
        prisma.comic.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, coverImage: true, creator: { select: { username: true } } }
        }),
        prisma.comic.findMany({
            take: 5,
            orderBy: { viewCount: 'desc' },
            select: { id: true, title: true, viewCount: true }
        })
    ]);

    return {
        stats,
        recentUsers,
        recentComics,
        topComics
    };
};

module.exports = {
    getAllStatistic,
    getAllUsers,
    banUser,
    unbanUser,
    getTransactions,
    getDashboard
}