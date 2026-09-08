const {
    getCommentsByChapter,
    addComment,
    editComment,
    removeComment
} = require('./comment.service')

const asyncHandler = require('../../utils/asyncHandler');

const getByChapter = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId)

    const result = await getCommentsByChapter(chapterId);
    res.json({success:true,data:result});
})

const add = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId)
    const userId = req.user.sub
    const content = req.body.content

    const result = await addComment(chapterId,userId,content);
    res.status(201).json({success:true,data:result});
})

const edit = asyncHandler(async(req,res)=>{
    const commentId = Number(req.params.commentId)
    const userId = req.user.sub
    const userRole = req.user.role
    const content = req.body.content

    const result = await editComment(commentId,userId,userRole,content);
    res.json({success:true,data:result});
})

const remove = asyncHandler(async(req,res)=>{
    const commentId = Number(req.params.commentId)
    const userId = req.user.sub
    const userRole = req.user.role

    const result = await removeComment(commentId,userId,userRole);
    res.json({success:true,data:result});
})

module.exports = {
    getByChapter,
    add,
    edit,
    remove
}