const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const optionalAuth = require('../../middlewares/optionalAuth.middleware');
const {
    getChapters,
    getOne,
    getContent,
    add,
    edit,
    remove,
    unlock,
    replacePages
} = require('./chapter.controller');

const router = express.Router();

// public — no auth needed
router.get('/',getChapters);
router.get('/:chapterId',getOne);

router.get('/:chapterId/content',optionalAuth,getContent);
router.post('/', authenticate, add);  
router.patch('/:chapterId',authenticate,edit);
router.put('/:chapterId/pages', authenticate, replacePages);  
router.delete('/:chapterId',authenticate,remove);
router.post('/:chapterId/unlock',authenticate,unlock);

module.exports = router;