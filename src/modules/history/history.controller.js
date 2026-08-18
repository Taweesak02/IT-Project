const {
    getMyHistory
} = require('./history.service')

const asyncHandler = require('../../utils/asyncHandler');

const getHistory = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyHistory(userId);
    res.status(200).json({success:true,...result});
})


module.exports = {
    getHistory
}