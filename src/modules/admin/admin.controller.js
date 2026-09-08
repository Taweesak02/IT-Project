const {
    getAllStatistic,
    banUser,
    unbanUser,
    getTransactions
} = require('./admin.service')

const asyncHandler = require('../../utils/asyncHandler');

const getStatistic = asyncHandler(async(req,res)=>{
    const userRole = req.user.role

    const result = await getAllStatistic(userRole);
    res.status(200).json({success:true,...result});
})

const ban = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const targetUserId = req.params.id

    const result = await banUser(userRole,targetUserId);
    res.status(200).json({success:true,...result});
})

const unban = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const targetUserId = req.params.id

    const result = await unbanUser(userRole,targetUserId);
    res.status(200).json({success:true,...result});
})

const transactions = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const {page,limit,status} = req.query
    
    const result = await getTransactions(userRole,page,limit,status);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getStatistic,
    ban,unban,
    transactions
}