const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {isAdmin} = require('../../utils/checkUtil')

const getAllPayment = async()=>{
    const paymentMethods = await prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    })
    return paymentMethods
}

const getOnePayment = async (paymentMethodId) => {
    if (!paymentMethodId || Number.isNaN(paymentMethodId)) {
        throw new AppError('paymentMethodId is required', 400);
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
    });

    if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
    }

    return paymentMethod;
};

const addPayment = async(userRole,{name,code})=>{
    isAdmin(userRole)

    if (!name || !code) {
        throw new AppError('name and code are required', 400);
    }

    try {
        return await prisma.paymentMethod.create({
            data: { name, code }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('A payment method with this name or code already exists', 409);
        }
        throw err;
    }
}

const editPayment = async(userRole,paymentMethodId,{name,code,isActive})=>{
    isAdmin(userRole)

    const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
    });

    if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
    }

    try {
        return await prisma.paymentMethod.update({
            where: { id: paymentMethodId },
            data: { name, code, isActive }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            throw new AppError('A payment method with this name or code already exists', 409);
        }
        throw err;
    }
}

const removePayment = async(userRole,paymentMethodId)=>{
    isAdmin(userRole)

    const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId }
    });

    if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
    }

    // soft-delete: PaymentTransaction rows reference this method, so deactivate instead of hard-delete
    return prisma.paymentMethod.update({
        where: { id: paymentMethodId },
        data: { isActive: false }
    });
}

module.exports = {
    getAllPayment,
    getOnePayment,
    addPayment,
    editPayment,
    removePayment
}