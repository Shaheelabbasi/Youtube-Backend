const asyncHandler=require("../utils/asyncHandler.js");


const registerUser=asyncHandler(async(req,res,next)=>{

    res.status(200).json({
        message:"ok 11"
    })
})
module.exports=registerUser;