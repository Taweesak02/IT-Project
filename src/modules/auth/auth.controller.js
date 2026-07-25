const {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  getCurrentUser,
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

const me = async (req, res, next) => {
  try {
    const result = await getCurrentUser(req.user.sub);
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
  me,
};