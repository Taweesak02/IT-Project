const {
    getMyFollowed,
    followComic,
    unFollowComic
} = require('./follow.service')

const asyncHandler = require('../../utils/asyncHandler');

const getMy = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyFollowed(userId);
    res.status(200).json({success:true,...result});
})

const follow = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub
    
    const result = await followComic(comicId,userId);
    res.status(201).json({success:true,...result});
})

const unFollow = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub

    const result = await unFollowComic(comicId,userId);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getMy,
    follow,
    unFollow
}