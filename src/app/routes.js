const express = require('express');
const authRoutes = require('../modules/auth/auth.route');
const comicsRoutes = require('../modules/comicManagement/comicManagement.route');
const chapterRoutes = require('../modules/chapter/chapter.route')
const tagRoutes = require('../modules/tag/tag.route')
const categoryRoutes = require('../modules/category/category.route')
const uploadRoutes = require('../modules/upload/upload.route')
const comicPublic = require('../modules/comicPublic/comicPublic.route')
const coinPackage = require('../modules/coinPackage/coinPackage.route')

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/comic-manage', comicsRoutes);
router.use('/comicmanage', comicsRoutes);
router.use('/comic-public',comicPublic)
router.use('/comicpublic',comicPublic)
router.use('/chapter',chapterRoutes);
router.use('/tag',tagRoutes);
router.use('/category',categoryRoutes);
router.use('/upload',uploadRoutes);
router.use('/package',coinPackage);

module.exports = router;
