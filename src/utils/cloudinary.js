require("dotenv").config()
const cloudinary=require("cloudinary");
const fs=require("fs");
         
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_CLOUD_APIKEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APISECRET
});

const uploadOnCloudnary=async(localfilepath)=>{
try {
    if(!localfilepath) return null;
    // uplaod the file on cloudinary
  const response = await cloudinary.UploadStream.upload(localfilepath,{      resource_type:"auto"  })
    console.log("File uploaded on cloudinary ",response.url);
    return response;
} catch (error) {
    fs.unlinkSync(localfilepath);//delete local file after error in uploading to cloudinary
    return null;
}
}
module.exports=uploadOnCloudnary;