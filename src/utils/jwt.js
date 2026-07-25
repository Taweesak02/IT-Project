const jwt = require('jsonwebtoken');
const { jwtSecret, accessTokenExpiresIn } = require('../configs/env');

const generateToken = (payload, expiresIn = accessTokenExpiresIn) => {
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret); // throws if invalid/expired
};

module.exports = { generateToken, verifyToken };