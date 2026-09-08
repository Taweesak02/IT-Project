const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getStatistic,
    ban,
    unban,
    transactions
} = require('./admin.controller');

const router = express.Router()

router.get('/statistic', authenticate, getStatistic);
router.patch('/users/:id/ban', authenticate, ban);
router.patch('/users/:id/unban', authenticate, unban);
router.get('/transactions', authenticate, transactions);

module.exports = router