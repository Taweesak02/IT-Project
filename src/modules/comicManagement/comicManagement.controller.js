const {
    addComic,
    editComic,
    removeComic,
    getComicById,
    getComicByCreator,
    getComicStatistic
} = require('./comicManagement.service')

const asyncHandler = require('../../utils/asyncHandler');

const add = asyncHandler(async(req,res)=>{
    const result = await addComic(req.user.sub,req.body);
    res.status(201).json({ success: true, data: result });
});

const edit = asyncHandler(async(req,res)=>{
    const result = await editComic(Number(req.params.id),req.user.sub,req.user.role,req.body);
    res.json({ success: true, data: result });
});

const remove = asyncHandler(async(req,res)=>{
    const result = await removeComic(Number(req.params.id),req.user.sub,req.user.role);
    res.json({ success: true, data: result });
});

const getOne = asyncHandler(async(req,res)=>{
    const result = await getComicById(Number(req.params.id),req.user.sub,req.user.role);
    res.json({ success: true, data: result });
});

const getMyComics = asyncHandler(async(req,res)=>{
    const result = await getComicByCreator(req.user.sub);
    res.json({ success: true, data: result });
});

const statistic = asyncHandler(async(req,res)=>{
    const result = await getComicStatistic(Number(req.params.id),req.user.sub,req.user.role);
    res.json({ success: true, data: result });
});

module.exports = {
    add,
    edit,
    remove,
    getMyComics,
    getOne,
    statistic
};