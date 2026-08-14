const {
    getMyFavorites,
    addFavorite,
    removeFavorite
} = require('./favorite.service')

const asyncHandler = require('../../utils/asyncHandler');

const getMy = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyFavorites(userId);
    res.status(200).json({success:true,...result});
})

const add = asyncHandler(async(req,res)=>{
    const userId = req.user.sub
    const comicId = Number(req.params.comicId)

    const result = await addFavorite(comicId,userId);
    res.status(201).json({success:true,...result});
})

const remove = asyncHandler(async(req,res)=>{
    const userId = req.user.sub
    const comicId = Number(req.params.comicId)

    const result = await removeFavorite(comicId,userId);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getMy,
    add,
    remove
}