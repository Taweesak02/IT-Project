const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    add,
    edit,
    remove,
    getMyComics,
    getOne,
    statistic
} = require('./comicManagement.controller');

const router = express.Router();

router.get('/',authenticate,getMyComics);
router.get('/:id/statistic',authenticate,statistic);
router.get('/:id',authenticate,getOne);
router.post('/',authenticate,add);
router.patch('/:id',authenticate,edit);
router.delete('/:id',authenticate,remove);

// router.patch('/:id/reSubmit')

module.exports = router;