const {
    getAllPayment,
    getOnePayment,
    addPayment,
    editPayment,
    removePayment
} = require('./paymentMethod.service')

const asyncHandler = require('../../utils/asyncHandler');

const getAll = asyncHandler(async(req,res)=>{
    
    const result = await getAllPayment();
    res.status(200).json({success:true,...result});
})

const getOne = asyncHandler(async(req,res)=>{
    const paymentMethodId = Number(req.params.paymentMethodId)
    
    const result = await getOnePayment(paymentMethodId);
    res.status(200).json({success:true,...result});
})

const add = asyncHandler(async(req,res)=>{
    const paymentData = req.body
    const userRole = req.user.role

    const result = await addPayment(userRole,paymentData);
    res.status(201).json({success:true,...result});
})

const edit = asyncHandler(async(req,res)=>{
    const editData = req.body
    const paymentMethodId = Number(req.params.paymentMethodId)
    const userRole = req.user.role

    const result = await editPayment(userRole,paymentMethodId,editData);
    res.status(200).json({success:true,...result});
})

const remove = asyncHandler(async(req,res)=>{
    const paymentMethodId = Number(req.params.paymentMethodId)
    const userRole = req.user.role

    const result = await removePayment(userRole,paymentMethodId);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getAll,
    getOne,
    add,
    edit,
    remove
}
