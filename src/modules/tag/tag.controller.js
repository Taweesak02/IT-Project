const asyncHandler = require("../../utils/asyncHandler");
const {
    addTag,
    editTag,
    removeTag,
    getAllTags,
    getTagById
} = require('./tag.service');

const add = asyncHandler(async(req,res)=>{
    const userRole = req.user.role;
    const tagName = req.body.name;
    
    const result = await addTag(userRole,tagName);
    res.status(201).json({success:true,...result});
});

const edit = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId;
    const userRole = req.user.role;
    const newTagName = req.body.name;

    const result = await editTag(tagId,userRole,newTagName);
    res.status(200).json({success:true,...result});
});

const remove = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId;
    const userRole = req.user.role;

    const result = await removeTag(tagId,userRole);
    res.status(200).json({success:true,...result});
});

const getTags = asyncHandler(async(req,res)=>{
    const result = await getAllTags();
    res.status(200).json({success:true,...result});
});

const getOneTag = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId

    const result = await getTagById(tagId);
    res.status(200).json({success:true,...result});
});

module.exports = {
    add,
    edit,
    remove,
    getTags,
    getOneTag
};