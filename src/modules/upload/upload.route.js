const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware')

const{
    cover,
    chapter,
    avatar,
    remove
} = require('./upload.controller');

const router = express.Router();

router.post('/cover',authenticate,upload.single('image'),cover);
router.post('/chapter',authenticate,upload.single('image'),chapter);
router.post('/avatar',authenticate,upload.single('image'),avatar);
router.delete('/', authenticate, remove);

module.exports = router;