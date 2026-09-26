const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {getWallet,increaseWallet} = require('../wallet/wallet.service')
const {getOnePackage} = require("../coinPackage/coinPackage.service")
const generatePayload = require('promptpay-qr');
const QRCode = require('qrcode');

const purchasePackage = async(userId,{packageId,paymentMethodId})=>{
    const coinPackage = await getOnePackage(packageId)

    if(!paymentMethodId){
        throw new AppError('paymentMethodId is required', 400);
    }

    const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });

    if (!method || !method.isActive) {
        throw new AppError('Invalid or inactive payment method', 400);
    }

    if (!method.promptPayId) {
        throw new AppError('This payment method is not configured yet', 400);
    }

    const paymentTransaction = await prisma.paymentTransaction.create({
        data: {
            userId,
            amount: coinPackage.price,
            coinPackageId: coinPackage.id,
            paymentMethodId,
            paymentStatus: 'PENDING'
        }
    });

    const amountInBaht = coinPackage.price / 100;
    const payload = generatePayload(method.promptPayId, { amount: amountInBaht });
    const qrImage = await QRCode.toDataURL(payload);

    return {
        paymentTransactionId: paymentTransaction.id,
        qrImage,
        amount: coinPackage.price
    };
    
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

const verifySlip = async (transactionId, userId, file) => {
    const transaction = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } });

    if (!transaction) throw new AppError('Transaction not found', 404);
    if (transaction.userId !== userId) throw new AppError('Not your transaction', 403);
    if (transaction.paymentStatus !== 'PENDING') throw new AppError('Transaction already processed', 400);

    if (!file) {
        throw new AppError('Slip image is required', 400);
    }

    const slipUrl = `/uploads/${file.filename}`; 

    // TODO: call SlipOK/EasySlip here, confirm isValid
//     const verifyResponse = await axios.post(
//     process.env.SLIP_VERIFICATION_API_URL,
//     { /* their expected payload — file data, usually */ },
//     { headers: { 'x-authorization': process.env.SLIP_VERIFICATION_API_KEY } }
// );

//     const isValid = verifyResponse.data.success &&
//     verifyResponse.data.data.amount === transaction.amount / 100;
    const isValid = true;   

    if (!isValid) {
        throw new AppError('Slip verification failed', 400);
    }

    return prisma.$transaction(async (tx) => {
        const completedPayment = await tx.paymentTransaction.update({
            where: { id: transactionId },
            data: { paymentStatus: 'COMPLETED', slipImageUrl: slipUrl, verifiedAt: new Date() }
        });

        const wallet = await getWallet(userId);
        const coinPackage = await tx.coinPackage.findUnique({ where: { id: transaction.coinPackageId } });

        const coinTransaction = await increaseWallet(wallet.id, coinPackage.coinAmount, tx, {
            transactionType: 'PURCHASE',
            paymentTransactionId: completedPayment.id
        });

        return { payment: completedPayment, coinTransaction };
    });
};

module.exports = {
    purchasePackage,
    getPaymentHistory,
    getPaymentStatus,
    verifySlip
}