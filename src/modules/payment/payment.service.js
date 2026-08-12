const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {getWallet,increaseWallet} = require('../wallet/wallet.service')
const {getOnePackage} = require("../coinPackage/coinPackage.service")

const purchasePackage = async(userId,{packageId,paymentMethodId})=>{
    const package = await getOnePackage(packageId)

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
                amount: package.price,
                coinPackageId: package.id,
                paymentMethodId,
                paymentStatus: 'PENDING'
            }
        });

        const completedPayment = await tx.paymentTransaction.update({
            where: { id: paymentTransaction.id },
            data: { paymentStatus: 'COMPLETED' }
        });

        const wallet = await getWallet(userId);

        await increaseWallet(wallet.id,package.coinAmount,tx)

        const coinTransaction = await tx.coinTransaction.create({
            data: {
                walletId: wallet.id,
                coinAmount: package.coinAmount,
                transactionType: 'PURCHASE',
                paymentTransactionId: completedPayment.id
            }
        });

        return {
            payment: completedPayment,
            coinTransaction
        }
        
    })

}

module.exports = {
    purchasePackage
}