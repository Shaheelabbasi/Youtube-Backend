const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,  //allowing  including the credentials such as cookies and other headers
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
//extended for objects with in the object  i. e for nested objectss
// url encoded for getting the data from the url .
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public")); // to store images and favicons publically on the servers
app.use(cookieparser());   // to accesss ans set the cookies from the server to the user browser

//Routes
const userRouter=require("./routes/user.routes.js");
app.use("/api/v1/users",userRouter);


module.exports = app;
