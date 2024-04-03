const express=require("express");
const Router=express.Router();

const registerUsers=require("../controllers/user.controller.js");

Router.route("/register").post(registerUsers);

module.exports=Router;
