const express = require('express');
const {
    getComic,
    popular,
    topRated,
    mostFollowed,
    getComicDetail
} = require('./comicPublic.controller');

const router = express.Router();

router.get('/',getComic);
router.get('/popular',popular);
router.get('/top-rated', topRated);             // sorted by average rating
router.get('/most-followed', mostFollowed);     // sorted by follow count
// router.get('/newupdate', newUpdate);  
router.get('/:comicId',getComicDetail);


module.exports = router;