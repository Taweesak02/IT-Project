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
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json({ success: true, ...result });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await refreshUserSession(req.body.refreshToken);
  res.json({ success: true, ...result });
});

const logout = asyncHandler(async (req, res) => {
  const result = await logoutUser(req.user.sub, req.body.refreshToken);
  res.json({ success: true, ...result });
});

const logoutAll = asyncHandler(async (req, res) => {
  const result = await logoutFromAllDevices(req.user.sub);
  res.json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  const result = await getCurrentUser(req.user.sub);
  res.json({ success: true, ...result });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body?.token || req.query?.token;
  const result = await verifyUserEmail(token);
  res.json({ success: true, ...result });
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await resendVerificationEmail(req.body?.email);
  res.json({ success: true, ...result });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.body?.email);
  res.json({ success: true, ...result });
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body?.token, req.body?.newPassword);
  res.json({ success: true, ...result });
});

const changePasswordController = asyncHandler(async (req, res) => {
  const result = await changePassword(req.user.sub, req.body?.currentPassword, req.body?.newPassword);
  res.json({ success: true, ...result });
});

const updateProfileController = asyncHandler(async (req, res) => {
  const result = await updateProfile(req.user.sub, req.body);
  res.json({ success: true, ...result });
});

const updateEmailController = asyncHandler(async (req, res) => {
  const result = await updateEmail(req.user.sub, req.body?.currentPassword, req.body?.newEmail);
  res.json({ success: true, ...result });
});

const deleteAccountController = asyncHandler(async (req, res) => {
  const result = await deleteAccount(req.user.sub, req.body?.currentPassword);
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