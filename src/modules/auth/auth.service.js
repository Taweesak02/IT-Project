const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../../configs/db');
const { generateToken } = require('../../utils/jwt');
const AppError = require('../../utils/AppError');
const { refreshTokenExpiresInMinutes } = require('../../configs/env');
const { sanitizeUser } = require('./auth.model');

const createSessionTokens = async (user) => {
  const accessToken = generateToken({ sub: user.id, email: user.email, role: user.role?.roleName || user.roleName || 'user' });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + refreshTokenExpiresInMinutes * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

const registerUser = async ({ email, username, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = username ? String(username).trim() : normalizedEmail.split('@')[0];

  if (!normalizedEmail.includes('@')) {
    throw new AppError('A valid email is required', 400);
  }

  if (String(password).length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError('Email already taken', 409);
  }

  let role = await prisma.role.findUnique({ where: { roleName: 'user' } });
  if (!role) {
    role = await prisma.role.create({ data: { roleName: 'user' } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      roleId: role.id,
    },
    include: { role: true },
  });

  const { accessToken, refreshToken } = await createSessionTokens(createdUser);

  return {
    user: sanitizeUser(createdUser),
    accessToken,
    refreshToken,
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValidPassword = await bcrypt.compare(String(password), user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const { accessToken, refreshToken } = await createSessionTokens(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

const refreshUserSession = async (refreshTokenValue) => {
  if (!refreshTokenValue) {
    throw new AppError('Refresh token is required', 400);
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: { include: { role: true } } },
  });

  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true },
  });

  const { accessToken, refreshToken } = await createSessionTokens(tokenRecord.user);

  return {
    user: sanitizeUser(tokenRecord.user),
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (userId, refreshTokenValue) => {
  if (refreshTokenValue) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshTokenValue,
      },
      data: { revoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });

  return { message: 'Logged out successfully' };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { user: sanitizeUser(user) };
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  getCurrentUser,
};