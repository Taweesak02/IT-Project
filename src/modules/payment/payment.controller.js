const {
  purchasePackage
} = require('./payment.service')

const asyncHandler = require('../../utils/asyncHandler');

const purchase = asyncHandler(async(req,res)=>{
    const purchaseData = req.body
    const userId = req.user.sub

    const result = await purchasePackage(userId,purchaseData)
    res.status(201).json({success:true,...result});
})

module.exports = {
    purchase
}