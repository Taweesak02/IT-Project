const {
    getChaptersByComicId,
    getUnlockedChapters,
    getChapterById,
    getChapterContent,
    addChapter,
    editChapter,
    removeChapter,
    unlockChapter,
    replaceChapterPages
} = require('./chapter.service')

const asyncHandler = require("../../utils/asyncHandler");

const getChapters = asyncHandler(async(req,res)=>{
    const comicId = Number(req.query.comicId);
    
    const result = await getChaptersByComicId(comicId);
    res.json({success:true,data:result});
});

const getOne = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);

    const result = await getChapterById(chapterId);
    res.json({success:true,data:result});
});

const getUnlocked = asyncHandler(async(req,res)=>{
    const userId = Number(req.user.sub);
    const comicId = req.query.comicId === undefined ? undefined : Number(req.query.comicId);
    const result = await getUnlockedChapters(userId, comicId);
    res.json({success:true,data:result});
});

const getContent = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user?.sub) ?? null;
    const userRole = req.user?.role ?? null;
 
    const result = await getChapterContent(chapterId, userId, userRole);
    res.json({success:true,data:result});
});

const add = asyncHandler(async(req,res)=>{
    const userId = Number(req.user.sub);
    const userRole = req.user.role;
    const addData = req.body;

    const result = await addChapter(userId,userRole,addData);
    res.status(201).json({success:true,data:result});
});

const edit = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);
    const userRole = req.user.role;
    const editData = req.body

    const result = await editChapter(chapterId,userId,userRole,editData);
    res.json({success:true,data:result});
});

const remove = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);
    const userRole = req.user.role;

    const result = await removeChapter(chapterId,userId,userRole);
    res.json({success:true,data:result});
});

const unlock = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);

    const result = await unlockChapter(chapterId,userId);
    res.status(201).json({success:true,data:result});
});

const replacePages = asyncHandler(async(req,res)=>{
    const chapterId = Number(req.params.chapterId);
    const userId = Number(req.user.sub);
    const userRole = req.user.role;
    const pages = req.body.pages

    const result = await replaceChapterPages(chapterId,userId,userRole,pages);
    res.json({success:true,data:result});
});

module.exports = {
    getChapters,
    getUnlocked,
    getOne,
    getContent,
    add,
    edit,
    remove,
    unlock,
    replacePages
};
