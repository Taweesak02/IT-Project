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

const increaseWallet = async(walletId,amount,tx = prisma)=>{
    await tx.coinWallet.update({
        where:{id:walletId},
        data:{
            balance:{
                increment: amount
            }
        }
    })
}

const decreaseWallet = async(walletId,amount,tx = prisma)=>{
    await tx.coinWallet.update({
        where:{id:walletId},
        data:{
            balance:{
                decrement: amount
            }
        }
    })
}

module.exports = {
    getWallet,
    getHistory,
    createWallet,
    increaseWallet,
    decreaseWallet
}