const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {getWallet,increaseWallet} = require('../wallet/wallet.service')
const {getOnePackage} = require("../coinPackage/coinPackage.service")

const purchasePackage = async(userId,{packageId,paymentMethodId})=>{
    const coinPackage = await getOnePackage(packageId)

    if(!paymentMethodId){
        throw new AppError('paymentMethodId is required', 400);
    }

    const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });

    if (!method || !method.isActive) {
        throw new AppError('Invalid or inactive payment method', 400);
    }

    const purchase = await prisma.$transaction(async(tx)=>{
        const paymentTransaction = await tx.paymentTransaction.create({
            data: {
                userId,
                amount: coinPackage.price,
                coinPackageId: coinPackage.id,
                paymentMethodId,
                paymentStatus: 'PENDING'
            }
        });

        const completedPayment = await tx.paymentTransaction.update({
            where: { id: paymentTransaction.id },
            data: { paymentStatus: 'COMPLETED' }
        });

        const wallet = await getWallet(userId);

        const coinTransaction = await increaseWallet(wallet.id, coinPackage.coinAmount, tx, {
            transactionType: 'PURCHASE',
            paymentTransactionId: completedPayment.id
        });

        return {
            payment: completedPayment,
            coinTransaction
        }
        
    })

}

const getPaymentStatus = async (transactionId, userId, userRole) => {
    if (!transactionId || Number.isNaN(transactionId)) {
        throw new AppError('transactionId is required', 400);
    }

    const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: {
            coinPackage: { select: { name: true, coinAmount: true } },
            paymentMethod: { select: { name: true } }
        }
    });

    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    // only the user who made the purchase (or admin) can view its status
    if (transaction.userId !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to view this transaction', 403);
    }

    return transaction;
};

const getPaymentHistory = async (userId) => {
    return prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            coinPackage: { select: { name: true, coinAmount: true } },
            paymentMethod: { select: { name: true } }
        }
    });
};

module.exports = {
    purchasePackage,
    getPaymentHistory,
    getPaymentStatus
}