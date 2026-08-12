const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    purchase
} = require('./payment.controller');

const router = express.Router();

router.post('/',authenticate,purchase)

module.exports = router