const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getByChapter,
    add,
    edit,
    remove
} = require('./comment.controller');

const router = express.Router();

router.get('/:chapterId', getByChapter);
router.post('/:chapterId', authenticate, add);
router.patch('/:commentId', authenticate, edit);
router.delete('/:commentId', authenticate, remove);

module.exports = router