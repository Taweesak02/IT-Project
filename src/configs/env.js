require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresInMinutes: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES || 10080),
  nodeEnv: process.env.NODE_ENV || 'development',
};