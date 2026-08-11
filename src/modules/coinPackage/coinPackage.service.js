const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {getWallet,increaseWallet} = require('../wallet/wallet.service')

const getAllPackage = async()=>{
    const packages = await prisma.coinPackage.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });
    return packages;
}

const getOnePackage = async(packageId)=>{
    if (!packageId || Number.isNaN(packageId)) {
        throw new AppError('packageId is required', 400);
    }
 
    const package = await prisma.coinPackage.findUnique({ where: { id: packageId } });
    
    if (!package) {
        throw new AppError('Coin package not found',404);
    }
 
    return package;
}

const addPackage = async(userRole,{name,coinAmount,price})=>{
    isAdmin(userRole);
 
    if (!name || !coinAmount || !price) {
        throw new AppError('name, coinAmount, and price are required', 400);
    }
 
    return prisma.coinPackage.create({
        data: { name, coinAmount, price }
    });
}

const editPackage = async(userRole,packageId,{name,coinAmount,price,isactive})=>{
    isAdmin(userRole);
 
    const package = await prisma.coinPackage.findUnique({ where: { id: packageId } });
 
    if (!package) {
        throw new AppError('Coin package not found', 404);
    }
 
    return prisma.coinPackage.update({
        where: { id: packageId },
        data: {
            name,
            coinAmount,
            price,
            isActive: isactive
        }
    });
}

const removePackage = async(userRole,packageId)=>{
    isAdmin(userRole);
 
    const package = await prisma.coinPackage.findUnique({ where: { id: packageId } });
 
    if (!package) {
        throw new AppError('Coin package not found', 404);
    }
 
    // soft-delete: Payment rows reference this package, so we deactivate instead of hard-deleting
    return prisma.coinPackage.update({
        where: { id: packageId },
        data: { isActive: false }
    });
}
//package cointransaction paymenttransaction
const purchasePackage = async(userId,packageId,paymentMethodId)=>{
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

const isAdmin = async(userRole)=>{
     if (userRole !== 'admin') {
        throw new AppError('You do not have permission to perform this action', 403);
    }
}

module.exports = {
    getAllPackage,
    getOnePackage,
    addPackage,
    editPackage,
    removePackage,
    purchasePackage
}