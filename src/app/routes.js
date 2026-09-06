const express = require('express');
const authRoutes = require('../modules/auth/auth.route');
const comicsRoutes = require('../modules/comicManagement/comicManagement.route');
const chapterRoutes = require('../modules/chapter/chapter.route')
const tagRoutes = require('../modules/tag/tag.route')
const categoryRoutes = require('../modules/category/category.route')
const uploadRoutes = require('../modules/upload/upload.route')
const comicPublic = require('../modules/comicPublic/comicPublic.route')
const coinPackage = require('../modules/coinPackage/coinPackage.route')
const coinWallet = require('../modules/wallet/wallet.route')
const payment = require('../modules/payment/payment.route')
const paymentMethod = require('../modules/paymentMethod/paymentMethod.route')
const rating = require('../modules/rating/rating.route')
const favorite = require('../modules/favorite/favorite.route')
const follow = require('../modules/follow/follow.route')
const comment = require('../modules/comment/comment.route')
const history = require('../modules/history/history.route')
const notification = require('../modules/notification/notification.route')
const admin = require('../modules/admin/admin.route')

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/comic-manage', comicsRoutes);
router.use('/comicmanage', comicsRoutes);
router.use('/public',comicPublic)
router.use('/chapter',chapterRoutes);
router.use('/tag',tagRoutes);
router.use('/category',categoryRoutes);
router.use('/upload',uploadRoutes);
router.use('/package',coinPackage);
router.use('/wallet',coinWallet)
router.use('/payment',payment)
router.use('/paymentmethod',paymentMethod)
router.use('/payment-method',paymentMethod)
router.use('/rating',rating)
router.use('/favorite',favorite)
router.use('/follow',follow)
router.use('/comment',comment)
router.use('/history',history)
router.use('/notification',notification)
router.use('/admin',admin)

module.exports = router;
