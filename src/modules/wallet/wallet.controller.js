const {
  getWallet,
  getHistory
} = require('./wallet.service')

const asyncHandler = require('../../utils/asyncHandler');

const wallet = asyncHandler(async(req,res)=>{
    const userId = req.user.sub;

    const result = await getWallet(userId);
    res.json({success:true,data:result});
});

const history = asyncHandler(async(req,res)=>{
    const userId = req.user.sub;

    const result = await getHistory(userId);
    res.json({success:true,data:result});
});


module.exports = {
    wallet,
    history,
}