const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    getAll,
    getOne,
    add,
    edit,
    remove
} = require('./paymentMethod.controller');

const router = express.Router();

router.get('/',getAll)
router.get('/:paymentMethodId',getOne)
router.post('/',authenticate,add)
router.patch('/:paymentMethodId',authenticate,edit)
router.delete('/:paymentMethodId',authenticate,remove)

module.exports = router;