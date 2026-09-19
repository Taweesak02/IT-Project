const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    add,
    edit,
    remove,
    resubmit,
    getMyComics,
    getOne,
    overview,
    statistic
} = require('./comicManagement.controller');

const router = express.Router();

router.get('/',authenticate,getMyComics);
router.get('/overview',authenticate,overview);
router.get('/:id/statistic',authenticate,statistic);
router.get('/:id',authenticate,getOne);
router.post('/',authenticate,add);
router.patch('/:id',authenticate,edit);
router.delete('/:id',authenticate,remove);
router.patch('/:id/resubmit', authenticate, resubmit);

module.exports = router;