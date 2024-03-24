const mongoose=require("mongoose");
const DBNAME =require("../constants")
const connectDB=async()=>{
    try {
    const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DBNAME}`);
    console.log("SUCCESSFULLY CONNECTED TO MONGODB:"+connectionInstance.connection.host)

    } catch (error) {
        console.log("MONGOB CONNECTION FAILED ",error);
        
    }
}
module.exports= 
{connectDB};