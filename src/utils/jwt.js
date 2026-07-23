const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../configs/env');

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret); // throws if invalid/expired
};

module.exports = { generateToken, verifyToken };