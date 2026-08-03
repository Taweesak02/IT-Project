const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const{
    add,
    edit,
    remove,
    getTags,
    getOneTag
} = require('./tag.controller');

const router = express.Router();

router.get('/',getTags);
router.get('/:tagId',getOneTag);
router.post('/',authenticate,add);
router.patch('/:tagId',authenticate,edit);
router.delete('/:tagId',authenticate,remove);

module.exports = router;