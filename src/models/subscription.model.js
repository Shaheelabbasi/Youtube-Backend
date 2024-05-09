const mongoose=require("mongoose")


const SubscriptionSchema=new mongoose.Schema(
   {
    subscriber:{
// the users which subscribe the chanel
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    channel:{
        // the chanel which is subscribed 
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    
   },{timestamps:true})


const Subscription=mongoose.model("subscription",SubscriptionSchema)
module.exports=Subscription;