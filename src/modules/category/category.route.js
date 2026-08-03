const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const {
    add,
    edit,
    remove,
    getCategories,
    getOneCategory
} = require('./category.controller');

const router = express.Router();

router.get('/', getCategories);
router.get('/:categoryId', getOneCategory);
router.post('/', authenticate, add);
router.patch('/:categoryId', authenticate, edit);
router.delete('/:categoryId', authenticate, remove);

module.exports = router;
