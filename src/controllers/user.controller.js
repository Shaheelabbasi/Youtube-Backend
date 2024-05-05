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
   const existedUser=await userModel.findOne({
      $or:[
        {username},
        {email}
      ]
   })
   if(existedUser)
   {
    throw new ApiError(409,"user with email or username already exists")
   }

   //we use optional channing to iterate over the an array of objects 
   // that dont have the similar properties 
   //one object might have one property,the second one might not
   // and third one might again have that property 
   // when we iterate over such objects we get an error 

   
//    console.log("checking files object",req.files?.avatar[0].path)
    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path
    
let coverImagePath1;
if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0)
    {
        coverImagePath1=req.files?.coverImage[0]?.path
    }

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"avatar is required");
    }

    
    
    
     const avatar= await uploadOnCloudnary(avatarLocalPath)
     const coverImage=await uploadOnCloudnary(coverImagePath1)
    
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
        "-password -refreshtoken"
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