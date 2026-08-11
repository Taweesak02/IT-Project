const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    wallet,
    history,
} = require('./wallet.controller');

const router = express.Router();

router.get('/',authenticate,wallet);
router.get('/history',authenticate,history)

module.exports = router;