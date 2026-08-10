const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getPackage,
    getOne,
    add,
    edit,
    remove
} = require('./coinPackage.controller');

const router = express.Router();

router.get('/',getPackage);
router.get('/:packageId',getOne);
router.post('/',authenticate,add);
router.patch('/:packageId',authenticate,edit);
router.delete('/:packageId',authenticate,remove)

module.exports = router;