const asyncHandler=require("../utils/asyncHandler.js");
const ApiError=require("../utils/ApiError.js");
const ApiResponse=require("../utils/Apiresponse.js");
const userModel=require("../models/user.model.js")
const uploadOnCloudnary=require("../utils/cloudinary.js")

const registerUser=asyncHandler(async(req,res,next)=>{

    
    //get the user details from the frontend
    const{username,email,fullname,password}=req.body
   if([username,email,fullname,password].some((field)=>field.trim()===""))
   {
    throw new ApiError(400,"All the fields are required")
   }
   const existedUser=userModel.findOne({
      $or:[
        {username},
        {email}
      ]
   })
   
   if(existedUser)
   {
    throw new ApiError(409,"user with email or username already exists")
   }

    const avatarLocalPath=req.files?.path[0]
    const coverImageLocalPath=req.files?.path[0]
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"avatar is required");
    }
    
     const avatar= await uploadOnCloudnary(avatarLocalPath)
     const coverImage= await uploadOnCloudnary(coverImageLocalPath)
     if(!avatar)
     {
        throw new ApiError(400,"avatar is required");
     }

   const User= await userModel.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url  || "",
            email,
            password,
            username:username.toLowerCase()

        }
    )
    const createdUser=await userModel.findById(User._id).select(
        "-password -refreshToken"
    )
if(!createdUser)
{
    throw new ApiError(500,"Something went wrong while registering the user")
}
return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
)
})
module.exports=registerUser;