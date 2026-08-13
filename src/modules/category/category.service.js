const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');
const {isAdmin} = require('../../utils/checkUtil')

const addCategory = async (userRole, categoryName) => {
    isAdmin(userRole);

    const normalizedCategoryName = String(categoryName ?? '').trim().toLowerCase();
    if (!normalizedCategoryName) {
        throw new AppError('Category name is required', 400);
    }

    try {
        const createdCategory = await prisma.category.create({
            data: {
                name: normalizedCategoryName
            }
        });

        return { category: createdCategory };
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError('Category already exists', 409);
        }
        throw error;
    }
};

const editCategory = async (categoryId, userRole, newCategoryName) => {
    isAdmin(userRole);

    const parsedCategoryId = Number(categoryId);
    if (Number.isNaN(parsedCategoryId)) {
        throw new AppError('Valid categoryId is required', 400);
    }

    const normalizedCategoryName = String(newCategoryName ?? '').trim().toLowerCase();
    if (!normalizedCategoryName) {
        throw new AppError('Category name is required', 400);
    }

    const existingCategory = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
    if (!existingCategory) {
        throw new AppError('Category not found', 404);
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: { id: parsedCategoryId },
            data: { name: normalizedCategoryName }
        });

        return { category: updatedCategory };
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError('Category already exists', 409);
        }
        throw error;
    }
};

const removeCategory = async (categoryId, userRole) => {
    isAdmin(userRole);

    const parsedCategoryId = Number(categoryId);
    if (Number.isNaN(parsedCategoryId)) {
        throw new AppError('Valid categoryId is required', 400);
    }

    const existingCategory = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
    if (!existingCategory) {
        throw new AppError('Category not found', 404);
    }

    await prisma.category.delete({ where: { id: parsedCategoryId } });
    return { message: 'Category deleted successfully' };
};

const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    return { categories };
};

const getCategoryById = async (categoryId) => {
    const parsedCategoryId = Number(categoryId);
    if (Number.isNaN(parsedCategoryId)) {
        throw new AppError('Valid categoryId is required', 400);
    }

    const category = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
    if (!category) {
        throw new AppError('Category not found', 404);
    }

    return { category };
};

module.exports = {
    addCategory,
    editCategory,
    removeCategory,
    getAllCategories,
    getCategoryById
};
