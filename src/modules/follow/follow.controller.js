const {
    getMyFollowed,
    followComic,
    unFollowComic
} = require('./follow.service')

const asyncHandler = require('../../utils/asyncHandler');

const getMy = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyFollowed(userId);
    res.json({success:true,data:result});
})

const follow = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub
    
    const result = await followComic(comicId,userId);
    res.status(201).json({success:true,data:result});
})

const unFollow = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub

    const result = await unFollowComic(comicId,userId);
    res.json({success:true,data:result});
})

module.exports = {
    getMy,
    follow,
    unFollow
}