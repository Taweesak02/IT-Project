const {
    getComicRatings,
    getMyRating,
    rateComic,
    removeRating
} = require('./rating.service')

const asyncHandler = require('../../utils/asyncHandler');

const getRating = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)

    const result = await getComicRatings(comicId);
    res.status(200).json({success:true,...result});
});

const getMy = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub

    const result = await getMyRating(comicId,userId);
    res.status(200).json({success:true,...result});
})

const add = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub
    const rating = Number(req.body.rating)

    const result = await rateComic(comicId,userId,rating);
    res.status(201).json({success:true,...result});
});

const remove = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)
    const userId = req.user.sub

    const result = await removeRating(comicId,userId);
    res.status(200).json({success:true,...result});
})


module.exports = {
    getRating,
    getMy,
    add,
    remove
}