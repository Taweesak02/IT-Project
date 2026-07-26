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

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await refreshUserSession(req.body.refreshToken);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await logoutUser(req.user.sub, req.body.refreshToken);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const result = await logoutFromAllDevices(req.user.sub);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.user.sub);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body?.token || req.query?.token;
    const result = await verifyUserEmail(token);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const result = await resendVerificationEmail(req.body?.email);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body?.email);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const resetPasswordController = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body?.token, req.body?.newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const changePasswordController = async (req, res, next) => {
  try {
    const result = await changePassword(req.user.sub, req.body?.currentPassword, req.body?.newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateProfileController = async (req, res, next) => {
  try {
    const result = await updateProfile(req.user.sub, req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateEmailController = async (req, res, next) => {
  try {
    const result = await updateEmail(req.user.sub, req.body?.currentPassword, req.body?.newEmail);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const deleteAccountController = async (req, res, next) => {
  try {
    const result = await deleteAccount(req.user.sub, req.body?.currentPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

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