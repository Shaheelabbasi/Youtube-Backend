require("dotenv").config()
const {connectDB} =require("./db/connect.js")
const app=require("./app.js")

connectDB().
then(()=>{
    app.listen(process.env.PORT || 8000,()=>console.log(`Server is running on the port ${process.env.PORT}`))
    
})
.catch((err)=>{
    console.log("Error connecting to the database ",err)
});
