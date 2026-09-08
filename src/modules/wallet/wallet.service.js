const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const getWallet = async(userId)=>{
    const balance = await prisma.coinWallet.findUnique({
        where:{userId:userId}
    });

    return balance;
}

const getHistory = async(userId)=>{
    const historys = await prisma.$transaction(async(tx)=>{
        const walletId = await tx.coinWallet.findUnique({
            where:{userId:userId},
            select: { id: true }
        })

        const allHistory = await tx.coinTransaction.findMany({
            where:{walletId:walletId.id}
        });

        return allHistory
    })

    return historys
}

const createWallet = async(userId,tx = prisma)=>{
    await tx.coinWallet.create({
      data: {
        userId: userId,
        balance: 0
      }
    })
   
}

const increaseWallet = async(walletId,amount,tx = prisma, transactionData = {})=>{
    await tx.coinWallet.update({
        where:{id:walletId},
        data:{
            balance:{
                increment: amount
            }
        }
    })
    
    return tx.coinTransaction.create({
        data: {
            walletId,
            coinAmount: amount,
            transactionType: transactionData.transactionType ?? 'PURCHASE',
            paymentTransactionId: transactionData.paymentTransactionId ?? null
        }
    });
}

const decreaseWallet = async(walletId,amount,tx = prisma, transactionData = {})=>{
    await tx.coinWallet.update({
        where:{id:walletId},
        data:{
            balance:{
                decrement: amount
            }
        }
    })

    return tx.coinTransaction.create({
        data: {
            walletId,
            coinAmount: amount,
            transactionType: transactionData.transactionType ?? 'SPEND',
            paymentTransactionId: transactionData.paymentTransactionId ?? null
        }
    });
}

module.exports = {
    getWallet,
    getHistory,
    createWallet,
    increaseWallet,
    decreaseWallet
}