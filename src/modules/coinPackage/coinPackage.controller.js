const {
    getAllPackage,
    getOnePackage,
    addPackage,
    editPackage,
    removePackage,
} = require('./coinPackage.service')

const asyncHandler = require('../../utils/asyncHandler');

const getPackage = asyncHandler(async(req,res)=>{
    const result = await getAllPackage();
    res.status(200).json({success:true,...result});
});

const getOne = asyncHandler(async(req,res)=>{
    const packageId = Number(req.params.packageId);

    const result = await getOnePackage(packageId);
    res.status(200).json({success:true,...result});
});

const add = asyncHandler(async(req,res)=>{
    const userRole = req.user.role;
    const packageData = req.body;

    const result = await addPackage(userRole,packageData);
    res.status(201).json({success:true,...result});
});

const edit = asyncHandler(async(req,res)=>{
    const userRole = req.user.role;
    const packageId = Number(req.params.packageId);
    const packageData = req.body;

    const result = await editPackage(userRole,packageId,packageData);
    res.status(200).json({success:true,...result});
});

const remove = asyncHandler(async(req,res)=>{
    const userRole = req.user.role;
    const packageId = Number(req.params.packageId);

    const result = await removePackage(userRole,packageId);
    res.status(200).json({success:true,...result});
})

module.exports = {
    getPackage,
    getOne,
    add,
    edit,
    remove
}