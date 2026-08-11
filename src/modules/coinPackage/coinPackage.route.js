const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getPackage,
    getOne,
    add,
    purchase,
    edit,
    remove
} = require('./coinPackage.controller');

const router = express.Router();

router.get('/',getPackage);
router.get('/:packageId',getOne);
router.post('/',authenticate,add);
router.post('/:packageId/purchase',purchase);
router.patch('/:packageId',authenticate,edit);
router.delete('/:packageId',authenticate,remove)



module.exports = router;