const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    purchase,
    status,
    history
} = require('./payment.controller');

const router = express.Router();

router.post('/purchase',authenticate,purchase)
router.get('/status/:paymentTransactionId',authenticate,status)
router.get('/history', authenticate, history);

module.exports = router