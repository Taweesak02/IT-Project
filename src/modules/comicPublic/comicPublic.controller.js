const {
    searchComic,
    getPopularComics,
    getTopRatedComics,
    getMostFollowedComics,
    searchComicDetail
} = require('./comicPublic.service');

const asyncHandler = require("../../utils/asyncHandler");
// tag category comicname sort status page limit
const getComic = asyncHandler(async(req,res)=>{
    const queryData = req.query

    const result = await searchComic(queryData);
    res.status(200).json({success:true,...result});
});

const popular = asyncHandler(async(req,res)=>{
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getPopularComics(limit);
    res.status(200).json({success:true,...result});
});

const topRated = asyncHandler(async(req,res)=>{
     const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getTopRatedComics(limit);
    res.status(200).json({success:true,...result});
});

const mostFollowed = asyncHandler(async(req,res)=>{
     const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getMostFollowedComics(limit);
    res.status(200).json({success:true,...result});
});

const getComicDetail = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)

    const result = await searchComicDetail(comicId);
    res.status(200).json({success:true,...result});
});


module.exports = {
    getComic,
    popular,
    topRated,
    mostFollowed,
    getComicDetail
}