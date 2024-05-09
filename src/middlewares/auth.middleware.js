const Apierror = require("../utils/ApiError");
const asyncHandler=require("../utils/asyncHandler.js");
const Jwt=require("jsonwebtoken");
const userModel=require("../models/user.model.js")
const verifyJwt=asyncHandler(async(req,res,next)=>{

      const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
   if(!token)
    {
        new Apierror(401,"Unauthorized request")
    }

   const decodedToken= Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

  const user= await userModel.findById(decodedToken._id).select("-password -refreshToken")

  if(!user)
    {
        throw new Apierror(401,"Invalid access Token")
    }

         
    req.user=user;
    next();



  
})

module.exports=verifyJwt