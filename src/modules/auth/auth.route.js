const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const { register, login, refresh, logout, me } = require('./auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;