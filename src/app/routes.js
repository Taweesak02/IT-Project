const express = require('express');
const authRoutes = require('../modules/auth/auth.route');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

router.use('/auth', authRoutes);

module.exports = router;
