const asyncHandler = require('../../utils/asyncHandler');
const {
    addCategory,
    editCategory,
    removeCategory,
    getAllCategories,
    getCategoryById
} = require('./category.service');

const add = asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    const categoryName = req.body.name;

    const result = await addCategory(userRole, categoryName);
    res.status(201).json({ success: true, data:result });
});

const edit = asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;
    const userRole = req.user.role;
    const newCategoryName = req.body.name;

    const result = await editCategory(categoryId, userRole, newCategoryName);
    res.json({ success: true, data:result });
});

const remove = asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;
    const userRole = req.user.role;

    const result = await removeCategory(categoryId, userRole);
    res.json({ success: true, data:result });
});

const getCategories = asyncHandler(async (_req, res) => {
    const result = await getAllCategories();
    res.json({ success: true, data:result });
});

const getOneCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId;

    const result = await getCategoryById(categoryId);
    res.json({ success: true, data:result });
});

module.exports = {
    add,
    edit,
    remove,
    getCategories,
    getOneCategory
};
