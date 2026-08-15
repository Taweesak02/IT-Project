const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getMy,
    follow,
    unFollow
} = require('./follow.controller');

const router = express.Router();

router.get('/',authenticate,getMy)
router.post('/:comicId',authenticate,follow)
router.delete('/:comicId',authenticate,unFollow)


module.exports = router