require("dotenv").config()
const cloudinary=require("cloudinary").v2;


const fs=require("fs");
const { options } = require("../routes/user.routes");
         
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_CLOUD_APIKEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APISECRET
});

const uploadOnCloudnary=async(localfilepath)=>{
try {
    if(!localfilepath) return null;
    console.log("the file paths are ",localfilepath)
 const response= cloudinary.uploader.upload(localfilepath, { resource_type: "auto" }, (error, result) => {
    if (error) {
      console.error("Error uploading file:", error);
    } else {
      console.log("File uploaded successfully:", result.url);
      fs.unlinkSync(localfilepath)
      return result
    }
  });
  

    return response;
} catch (error) {
  console.log(error)
    fs.unlinkSync(localfilepath);//delete local file after error in uploading to cloudinary
    return null;
 }
}


const deleteFromCloudinary=(oldurl)=>{

  try {
    const lastDotIndex = oldurl.lastIndexOf('.');
    oldurl=oldurl.substring(0,lastDotIndex)

    const id=oldurl.split("/").pop();
     const response=   cloudinary.uploader.destroy(id).then((status)=>{
        console.log(status)
     });
    
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
module.exports={
  uploadOnCloudnary,
  deleteFromCloudinary
};