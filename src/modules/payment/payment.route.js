const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const{
    purchase,
    status,
    history,
    verifySlipController
} = require('./payment.controller');

const router = express.Router();

router.post('/purchase',authenticate,purchase)
router.post('/:transactionId/verify-slip',authenticate,upload.single('slip'),verifySlipController);
router.get('/status/:paymentTransactionId',authenticate,status)
router.get('/history', authenticate, history);

module.exports = router