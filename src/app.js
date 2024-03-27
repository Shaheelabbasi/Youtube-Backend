const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const cors = require("cors");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
//extended for objects with in the object
// url encoded for getting the data from the url .
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieparser());
module.exports = app;
