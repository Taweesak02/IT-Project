const {
    getMyFavorites,
    addFavorite,
    removeFavorite
} = require('./favorite.service')

const asyncHandler = require('../../utils/asyncHandler');

const getMy = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyFavorites(userId);
    res.json({success:true,data:result});
})

const add = asyncHandler(async(req,res)=>{
    const userId = req.user.sub
    const comicId = Number(req.params.comicId)

    const result = await addFavorite(comicId,userId);
    res.status(201).json({success:true,data:result});
})

const remove = asyncHandler(async(req,res)=>{
    const userId = req.user.sub
    const comicId = Number(req.params.comicId)

    const result = await removeFavorite(comicId,userId);
    res.json({success:true,data:result});
})

module.exports = {
    getMy,
    add,
    remove
}