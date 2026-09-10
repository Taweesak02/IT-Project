const express = require('express');
const optionalAuthenticate = require('../../middlewares/optionalAuth.middleware');
const {
    getComic,
    mostView,
    topRated,
    mostFollowed,
    mostFavorite,
    searchUsers,
    getUserComics,
    getComicDetail
} = require('./comicPublic.controller');

const router = express.Router();

router.get('/',getComic);
router.get('/user', optionalAuthenticate, searchUsers);
router.get('/user/:userId', getUserComics);
router.get('/most-view',mostView);
router.get('/top-rated', topRated);             
router.get('/most-followed', mostFollowed);     
router.get('/most-favorite', mostFavorite);
router.get('/:comicId',getComicDetail);


module.exports = router;