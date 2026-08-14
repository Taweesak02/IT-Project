const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getRating,
    getMy,
    add,
    remove
} = require('./rating.controller');

const router = express.Router();

router.get('/:comicId',getRating)
router.get('/:comicId/me',authenticate,getMy)
router.post('/:comicId',authenticate,add)
router.delete('/:comicId',authenticate,remove)

module.exports = router