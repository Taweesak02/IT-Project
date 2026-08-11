const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../../configs/db');
const { generateToken } = require('../../utils/jwt');
const { deleteFileByUrl } = require('../upload/upload.service');
const {createWallet} = require('../../modules/wallet/wallet.service')
const AppError = require('../../utils/AppError');
const {
  refreshTokenExpiresInMinutes,
  verificationTokenExpiresInMinutes,
  passwordResetTokenExpiresInMinutes,
  nodeEnv,
} = require('../../configs/env');
const { sanitizeUser } = require('./auth.model');

const requireActiveUser = (user) => {
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.status !== 'active') {
    throw new AppError('Account is inactive', 403);
  }

  return user;
};

const createEmailVerificationToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + verificationTokenExpiresInMinutes * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiresAt: expiresAt,
    },
  });

  return rawToken;
};

const createPasswordResetToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + passwordResetTokenExpiresInMinutes * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: expiresAt,
    },
  });

  return rawToken;
};

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
  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
        roleId: role.id,
      },
      include: { role: true },
    });

    await createWallet(user.id,tx)

    return user;
  });

  const verificationToken = await createEmailVerificationToken(createdUser.id);

  const { accessToken, refreshToken } = await createSessionTokens(createdUser);

  const response = {
    user: sanitizeUser(createdUser),
    accessToken,
    refreshToken,
    message: 'Registration successful. Please verify your email.',
  };

  if (nodeEnv !== 'production') {
    // Temporary response value for local/dev use until SMTP delivery is added.
    response.verificationToken = verificationToken;
  }

  return response;
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

  requireActiveUser(user);

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

  requireActiveUser(tokenRecord.user);

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

const logoutFromAllDevices = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireActiveUser(user);

  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });

  return { message: 'Logged out from all devices successfully' };
};

const requestPasswordReset = async (email) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    return { message: 'If an account exists, a password reset email was sent.' };
  }

  const resetToken = await createPasswordResetToken(user.id);
  const response = { message: 'Password reset token generated successfully.' };

  if (nodeEnv !== 'production') {
    response.resetToken = resetToken;
  }

  return response;
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError('Reset token and new password are required', 400);
  }

  if (String(newPassword).length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await bcrypt.hash(String(newPassword), 10);

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return tx.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
      include: { role: true },
    });
  });

  return {
    message: 'Password reset successfully',
    user: sanitizeUser(updatedUser),
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (String(newPassword).length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireActiveUser(user);

  const isValidPassword = await bcrypt.compare(String(currentPassword), user.password);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(String(newPassword), 10);

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    return tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
      include: { role: true },
    });
  });

  return {
    message: 'Password changed successfully',
    user: sanitizeUser(updatedUser),
  };
};

const updateProfile = async (userId, updates) => {
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  requireActiveUser(currentUser);

  const allowedUpdates = {};

  if (updates?.username !== undefined) {
    allowedUpdates.username = String(updates.username).trim() || null;
  }

  if (updates?.profileImage !== undefined) {
    const newImage = String(updates.profileImage).trim() || null;
    // delete old file if it's actually being replaced with something different
    if (currentUser.profileImage && currentUser.profileImage !== newImage) {
      await deleteFileByUrl(currentUser.profileImage);
    }
    allowedUpdates.profileImage = newImage;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    throw new AppError('At least one profile field is required', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
    include: { role: true },
  });

  return {
    message: 'Profile updated successfully',
    user: sanitizeUser(updatedUser),
  };
};

const updateEmail = async (userId, currentPassword, newEmail) => {
  if (!currentPassword || !newEmail) {
    throw new AppError('Current password and new email are required', 400);
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  requireActiveUser(currentUser);

  const isValidPassword = await bcrypt.compare(String(currentPassword), currentUser.password);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  const normalizedEmail = String(newEmail).trim().toLowerCase();
  if (!normalizedEmail.includes('@')) {
    throw new AppError('A valid email is required', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser && existingUser.id !== userId) {
    throw new AppError('Email already taken', 409);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      email: normalizedEmail,
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
    include: { role: true },
  });

  const verificationToken = await createEmailVerificationToken(userId);
  const response = {
    message: 'Email updated successfully. Please verify your new email.',
    user: sanitizeUser(updatedUser),
  };

  if (nodeEnv !== 'production') {
    response.verificationToken = verificationToken;
  }

  return response;
};

const deleteAccount = async (userId, currentPassword) => {
  if (!currentPassword) {
    throw new AppError('Current password is required', 400);
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  requireActiveUser(currentUser);

  const isValidPassword = await bcrypt.compare(String(currentPassword), currentUser.password);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  const placeholderEmail = `deleted-${userId}-${Date.now()}@deleted.local`;
  const revokedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        email: placeholderEmail,
        username: null,
        password: revokedPassword,
        emailVerified: false,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        profileImage: null,
        status: 'deleted',
      },
    });
  });

  if (currentUser.profileImage) {
    await deleteFileByUrl(currentUser.profileImage);
  }

  return { message: 'Account deleted successfully' };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  requireActiveUser(user);

  return { user: sanitizeUser(user) };
};

const verifyUserEmail = async (token) => {
  if (!token) {
    throw new AppError('Verification token is required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiresAt: { gt: new Date() },
    },
    include: { role: true },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
    include: { role: true },
  });

  return {
    message: 'Email verified successfully',
    user: sanitizeUser(updatedUser),
  };
};

const resendVerificationEmail = async (email) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    return { message: 'If an account exists, a verification email was re-sent.' };
  }

  if (user.emailVerified) {
    return { message: 'Email is already verified.' };
  }

  const verificationToken = await createEmailVerificationToken(user.id);
  const response = { message: 'Verification email re-sent successfully.' };

  if (nodeEnv !== 'production') {
    response.verificationToken = verificationToken;
  }

  return response;
};

module.exports = {
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
};