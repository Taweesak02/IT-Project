const {
  purchasePackage,
  getPaymentStatus,
  getPaymentHistory
} = require('./payment.service')

const asyncHandler = require('../../utils/asyncHandler');

const purchase = asyncHandler(async(req,res)=>{
    const purchaseData = req.body
    const userId = req.user.sub

    const result = await purchasePackage(userId,purchaseData)
    res.status(201).json({success:true,data:result});
})

const status = asyncHandler(async(req,res)=>{
    const transactionId = Number(req.params.paymentTransactionId)
    const userId = req.user.sub
    const userRole = req.user.role

    const result = await getPaymentStatus(transactionId,userId,userRole)
    res.json({success:true,data:result});
})

const history = asyncHandler(async(req,res)=>{
    const userId = req.user.sub

    const result = await getPaymentHistory(userId)
    res.json({success:true,data:result});
})

module.exports = {
    purchase,
    status,
    history
}