const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getNotifications,
    read
} = require('./notification.controller');

const router = express.Router()

router.get('/', authenticate,getNotifications);
router.patch('/:notificationId/read', authenticate,read);

module.exports = router