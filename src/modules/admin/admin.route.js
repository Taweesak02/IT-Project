const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getStatistic,
    getUsers,
    ban,
    unban,
    transactions,
    dashboard
} = require('./admin.controller');

const router = express.Router()

router.get('/statistic', authenticate, getStatistic);
router.get('/users', authenticate, getUsers);
router.patch('/users/:id/ban', authenticate, ban);
router.patch('/users/:id/unban', authenticate, unban);
router.get('/transactions', authenticate, transactions);
router.get('/dashboard', authenticate, dashboard);

module.exports = router