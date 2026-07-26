const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const {
	register,
	login,
	refresh,
	logout,
	logoutAll,
	me,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPasswordController,
	changePasswordController,
	updateProfileController,
	updateEmailController,
	deleteAccountController,
} = require('./auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, me);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', resetPasswordController);
router.patch('/change-password', authenticate, changePasswordController);
router.patch('/update-profile', authenticate, updateProfileController);
router.patch('/update-email', authenticate, updateEmailController);
router.patch('/updateemail', authenticate, updateEmailController);
router.delete('/delete-account', authenticate, deleteAccountController);
router.delete('/deleteaccount', authenticate, deleteAccountController);

module.exports = router;