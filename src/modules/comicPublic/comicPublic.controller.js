const {
    searchComic,
    getMostViewComics,
    getTopRatedComics,
    getMostFollowedComics,
    getMostFavoriteComics,
    searchPublicUsers,
    getComicsByUserId,
    searchComicDetail
} = require('./comicPublic.service');

const asyncHandler = require("../../utils/asyncHandler");

// ค้นหา Comic โดยมี Query(tag category comicname sort status page limit)
const getComic = asyncHandler(async(req,res)=>{
    const queryData = req.query

    const result = await searchComic(queryData);
    res.json({success:true,data:result});
});

// ดึงข้อมูล Comic ที่มียอดอ่านมากที่สุด
const mostView = asyncHandler(async(req,res)=>{
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getMostViewComics(limit);
    res.json({success:true,data:result});
});

// ดึงข้อมูล Comic ที่ คะแนนสูงสุด
const topRated = asyncHandler(async(req,res)=>{
     const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getTopRatedComics(limit);
    res.json({success:true,data:result});
});

// ดึงข้อมูล Comic ที่ผู้ติดตามมากที่สุด
const mostFollowed = asyncHandler(async(req,res)=>{
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getMostFollowedComics(limit);
    res.json({success:true,data:result});
});

// ดึงข้อมูล Comic ที่คนชอบมากที่สุด
const mostFavorite = asyncHandler(async(req,res)=>{
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await getMostFavoriteComics(limit);
    res.json({success:true,data:result});
});

// ค้นหาผู้ใช้
const searchUsers = asyncHandler(async(req,res)=>{
    const queryData = req.query;
    const userRole = req.user?.role ?? null;
    
    const result = await searchPublicUsers(queryData,userRole);
    res.json({success:true,data:result});
});

//แสดง Comic ด้วย userId
const getUserComics = asyncHandler(async(req,res)=>{
    const userId = req.params.userId;

    const result = await getComicsByUserId(userId);
    res.json({success:true,data:result});
});

// ดึงข้อมูล Comic ด้วย comicId
const getComicDetail = asyncHandler(async(req,res)=>{
    const comicId = Number(req.params.comicId)

    const result = await searchComicDetail(comicId);
    res.json({success:true,data:result});
});


module.exports = {
    getComic,
    mostView,
    topRated,
    mostFollowed,
    mostFavorite,
    searchUsers,
    getUserComics,
    getComicDetail
}