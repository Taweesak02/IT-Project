const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getMy,
    add,
    remove
} = require('./favorite.controller');

const router = express.Router();

router.get('/',authenticate,getMy)
router.post('/:comicId',authenticate,add)
router.delete('/:comicId',authenticate,remove)

module.exports = router