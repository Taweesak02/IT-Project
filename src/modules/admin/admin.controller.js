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
    res.json({success:true,data:result});
})

const ban = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const targetUserId = Number(req.params.id)

    const result = await banUser(userRole,targetUserId);
    res.json({success:true,data:result});
})

const unban = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const targetUserId = Number(req.params.id)

    const result = await unbanUser(userRole,targetUserId);
    res.json({success:true,data:result});
})

const transactions = asyncHandler(async(req,res)=>{
    const userRole = req.user.role
    const {page,limit,status} = req.query
    
    const result = await getTransactions(userRole,page,limit,status);
    res.json({success:true,data:result});
})

module.exports = {
    getStatistic,
    ban,unban,
    transactions
}