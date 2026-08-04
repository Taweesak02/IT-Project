const asyncHandler = require("../../utils/asyncHandler");
const {
    saveCover,
    saveAvatar,
    saveChapterPages,
    deleteFileByUrl
} = require('./upload.service');

const cover = asyncHandler(async(req,res)=>{
    const imgURL = req.file;
    
    const result = await saveCover(imgURL);
    res.status(201).json({ success: true, data: result });
});

const chapter = asyncHandler(async(req,res)=>{
    const imgURL = req.file; 
        
    const result = await saveChapterPages(imgURL)
    res.status(201).json({ success: true, data: result });
});

const avatar = asyncHandler(async(req,res)=>{
    const imgURL = req.file;

    const result = await saveAvatar(imgURL)
    res.status(201).json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
    const { url } = req.body;

    await deleteFileByUrl(url);
    res.status(200).json({ success: true });
});

module.exports = {
    cover,
    chapter,
    avatar,
    remove
};