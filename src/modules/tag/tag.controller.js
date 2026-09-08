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
    res.status(201).json({success:true,data:result});
});

const edit = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId;
    const userRole = req.user.role;
    const newTagName = req.body.name;

    const result = await editTag(tagId,userRole,newTagName);
    res.json({success:true,data:result});
});

const remove = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId;
    const userRole = req.user.role;

    const result = await removeTag(tagId,userRole);
    res.json({success:true,data:result});
});

const getTags = asyncHandler(async(req,res)=>{
    const result = await getAllTags();
    res.json({success:true,data:result});
});

const getOneTag = asyncHandler(async(req,res)=>{
    const tagId = req.params.tagId

    const result = await getTagById(tagId);
    res.json({success:true,data:result});
});

module.exports = {
    add,
    edit,
    remove,
    getTags,
    getOneTag
};