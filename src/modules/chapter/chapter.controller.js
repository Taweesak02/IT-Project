const {
    getChaptersByComicId,
    getChapterById,
    getChapterContent,
    addChapter,
    editChapter,
    removeChapter,
    unlockChapter
} = require('./chapter.service')

const asyncHandler = require("../../utils/asyncHandler");

const getChapters = asyncHandler(async(req,res)=>{
    const comicId = Number(req.query.comicId);
    
    const result = await getChaptersByComicId(comicId);
    res.status(200).json({success:true,...result});
});

const getOne = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);

    const result = await getChapterById(chapterId);
    res.status(200).json({success:true,...result});
});

const getContent = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user?.sub) ?? null;
    const userRole = req.user?.role ?? null;
 
    const result = await getChapterContent(chapterId, userId, userRole);
    res.status(200).json({success:true,...result});
});

const add = asyncHandler(async(req,res)=>{
    const userId = Number(req.user.sub);
    const userRole = req.user.role;
    const addData = req.body;

    const result = await addChapter(userId,userRole,addData);
    res.status(201).json({success:true,...result});
});

const edit = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);
    const userRole = req.user.role;
    const editData = req.body

    const result = await editChapter(chapterId,userId,userRole,editData);
    res.status(200).json({success:true,...result});
});

const remove = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);
    const userRole = req.user.role;

    const result = await removeChapter(chapterId,userId,userRole);
    res.status(200).json({success:true,...result});
});

const unlock = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);

    const result = await unlockChapter(chapterId,userId);
    res.status(200).json({success:true,...result});
});

module.exports = {
    getChapters,
    getOne,
    getContent,
    add,
    edit,
    remove,
    unlock
};