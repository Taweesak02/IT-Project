const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getHistory
} = require('./history.controller');

const router = express.Router();

router.get('/',authenticate,getHistory)

module.exports = router