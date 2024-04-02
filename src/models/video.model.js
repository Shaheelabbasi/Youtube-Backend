const mongoose=require("mongoose");
const  mongoosePaginate=require("mongoose-aggregate-paginate-v2");

const videoSchema=new mongoose.model(
    
    {
        Videofile:{
            type:String, // cloudnary url to of the video to be stored here
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
         duration:{
            type:Number, // from the cloudnary it provides all the ioformation about the video file
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        ispublished:{
            type:Boolean,
            default:true
        },




},

{timestamps:true}

);


videoSchema.plugin(mongoosePaginate);  // Here, the mongoosePaginate plugin specifically adds pagination capabilities


const Video=mongoose.model("Video",videoSchema);
module.exports=Video;




