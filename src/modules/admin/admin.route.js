const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getStatistic,
    searchComics,
    ban,
    unban,
    transactions,
    approveComic,
    unapproveComic
} = require('./admin.controller');

const router = express.Router()

router.get('/statistic', authenticate, getStatistic);
router.get('/comics', authenticate, searchComics);
router.patch('/users/:id/ban', authenticate, ban);
router.patch('/users/:id/unban', authenticate, unban);
router.patch('/comics/:id/approve', authenticate, approveComic);
router.patch('/comics/:id/unapprove', authenticate, unapproveComic);
router.get('/transactions', authenticate, transactions);

module.exports = router