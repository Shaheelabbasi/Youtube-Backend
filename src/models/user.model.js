require("dotenv").config()
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const userSchema=new mongoose.Schema({

    username:{
      type:String,
      unique:true,
      required:true,
      lowercase:true,
      trim:true,
     index:true                // to make the field searchable
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,              
      },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true          
      },
      avatar:{
        type:String,  //cloudinary upload images and files there and it gives url in return
        required:true,
                   
      },
      coverimage:{
        type:String
      },
      watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
      ],
      password:{
        type:String,
        required:[true,"password is required"],
      },
      refreshtoken:{
        type:String
      }

    




},{timestamps:true});




userSchema.pre("save",async function(next){
  if(this.isModified("password"))
  {

    this.password=await bcrypt.hash(this.password,10);
   return next();
  }
  next();
})
userSchema.methods.ispasswordCorrect=async function(password)
{
 return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken= function()
{
  return jwt.sign({
    id:this._id,
    email:this.email,
    username:this.username
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
  )
}
// reduces the need for the frequent login.
userSchema.methods.generateRefreshToken=function()
{
  //refersh token has less information and long expiry
  return jwt.sign(
    {
    id:this._id
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  }
  )

}

const User=mongoose.model("User",userSchema);
module.exports=User;
