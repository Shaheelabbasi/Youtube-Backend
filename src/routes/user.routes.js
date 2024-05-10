const express=require("express");
const upload=require("../middlewares/multer.middleware.js");
const verifyJwt=require("../middlewares/auth.middleware.js")
const Router=express.Router();

// const registerUsers=require("../controllers/user.controller.js");
// const registerUsers=require("../controllers/user.controller.js");
const{ loginUser,registerUser,LogoutUser,refreshAccessToken,UpdateUserAvatar}=require("../controllers/user.controller.js");


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
  ]),registerUser);

 Router.route("/login").post(loginUser)
 //secured routes.
 Router.route("/logout").post(verifyJwt,LogoutUser)
 Router.route("/refreshToken").post(refreshAccessToken)
 Router.route("/update-avatar").post(
    upload.single("avatar"),
    verifyJwt,
    UpdateUserAvatar )


module.exports=Router;



