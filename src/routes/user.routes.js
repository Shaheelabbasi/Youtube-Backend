const express=require("express");
const upload=require("../middlewares/multer.middleware.js");
const Router=express.Router();

const registerUsers=require("../controllers/user.controller.js");

Router.route("/register").post(
    upload.fields([

        // we are accepting two files on this route so we are making  two objects 
        {
            name:"avatar",
            maxCount:1
        },
        {
         name:"coverImage",
         maxCount:1
        }
    ]),registerUsers);

module.exports=Router;

