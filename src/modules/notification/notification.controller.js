const {
    getMyNotifications,
    markAsRead
} = require('./notification.service')

const asyncHandler = require('../../utils/asyncHandler');

const getNotifications = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getMyNotifications(userId);
    res.status(200).json({success:true,...result});
})

const read = asyncHandler(async(req,res)=>{
    const notificationId = Number(req.params.notificationId)
    const userId = req.user.sub

    const result = await markAsRead(notificationId,userId);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getNotifications,
    read
}