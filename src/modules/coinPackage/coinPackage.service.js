const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {isAdmin} = require('../../utils/checkUtil')

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


module.exports = {
    getAllPackage,
    getOnePackage,
    addPackage,
    editPackage,
    removePackage,
 }