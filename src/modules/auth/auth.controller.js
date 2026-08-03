const {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  logoutFromAllDevices,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
  updateEmail,
  deleteAccount,
  verifyUserEmail,
  resendVerificationEmail,
} = require('./auth.service');

const asyncHandler = require('../../utils/asyncHandler')

const register = asyncHandler(async (req, res) => {
  const registerData = req.body;

  const result = await registerUser(registerData);
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const loginData = req.body;

  const result = await loginUser(loginData);
  res.json({ success: true, ...result });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  const result = await refreshUserSession(refreshToken);
  res.json({ success: true, ...result });
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const refreshToken = req.body.refreshToken;

  const result = await logoutUser(userId, refreshToken);
  res.json({ success: true, ...result });
});

const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const result = await logoutFromAllDevices(userId);
  res.json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const result = await getCurrentUser(userId);
  res.json({ success: true, ...result });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body?.token;

  const result = await verifyUserEmail(token);
  res.json({ success: true, ...result });
});

const resendVerification = asyncHandler(async (req, res) => {
  const email = req.body?.email;

  const result = await resendVerificationEmail(email);
  res.json({ success: true, ...result });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body?.email;

  const result = await requestPasswordReset(email);
  res.json({ success: true, ...result });
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const token = req.body?.token;
  const newPassword = req.body?.newPassword;

  const result = await resetPassword(token, newPassword);
  res.json({ success: true, ...result });
});

const changePasswordController = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const currentPassword =  req.body?.currentPassword;
  const newPassword = req.body?.newPassword;

  const result = await changePassword(userId,currentPassword, newPassword);
  res.json({ success: true, ...result });
});

const updateProfileController = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const updateData = req.body;

  const result = await updateProfile(userId, updateData);
  res.json({ success: true, ...result });
});

const updateEmailController = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const currentPassword = req.body?.currentPassword;
  const newEmail = req.body?.newEmail;

  const result = await updateEmail(userId,currentPassword ,newEmail);
  res.json({ success: true, ...result });
});

const deleteAccountController = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const currentPassword = req.body?.currentPassword;

  const result = await deleteAccount(userId, currentPassword);
  res.json({ success: true, ...result });
});

module.exports = {
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
};