const express = require('express');
const authRoutes = require('../modules/auth/auth.route');
const comicsRoutes = require('../modules/comicManagement/comicManagement.route');
const chapterRoutes = require('../modules/chapter/chapter.route')

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/comic-manage', comicsRoutes);
router.use('/comicmanage', comicsRoutes);
router.use('/chapter',chapterRoutes);

module.exports = router;
