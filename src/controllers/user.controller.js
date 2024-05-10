const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/Apiresponse.js");
const userModel = require("../models/user.model.js");
const {uploadOnCloudnary,deleteFromCloudinary} = require("../utils/cloudinary.js");
const Jwt = require("jsonwebtoken");
// const { fields } = require("../middlewares/multer.middleware.js");

const generateAccessTokenAndRefreshToken = async (user) => {
  try {
    //   console.log("user before update is ",user)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // console.log(" the updated user is ",user)
    const LoggedInUser = await user.save({ validateBeforeSave: false });
    //   .select("-password -refershToken")

    //   console.log("Logged In user is ",LoggedInUser)
    return { accessToken, refreshToken, LoggedInUser };
  } catch (error) {
    throw new ApiError(500, "Error while generating the tokens");
  }
};
const registerUser = asyncHandler(async (req, res, next) => {
  console.log("register has been called ");
  // get the user details from the frontend
  const { username, email, fullname, password } = req.body;

  if (
    [username, email, fullname, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All the fields are required");
  }
  const existedUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  //we use optional channing to iterate over the an array of objects
  // that dont have the similar properties
  //one object might have one property,the second one might not
  // and third one might again have that property
  // when we iterate over such objects we get an error

  //    console.log("checking files object",req.files?.avatar[0].path)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath=req.files?.coverImage[0]?.path

  let coverImagePath1;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath1 = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadOnCloudnary(avatarLocalPath);
  const coverImage = await uploadOnCloudnary(coverImagePath1);

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  const User = await userModel.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await userModel
    .findById(User._id)
    .select("-password -refreshtoken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  //  console.log("Login has been hit");

  //todos for the login
  //get the data form the user request
  // check for any empty fileds
  // match the user password with the existing passsword in the database
  // if correct geneerate an access token and store it in the cookie
  // generate a refersh token
  // log user out when the access token expires
  // now valiadte the user on the basis of the refresh token

  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  //   console.log(" the user is ",user)
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  // const passwordstatus=userModel.ispasswordCorrect(user.password)
  // the UserModel has mongoose schema methods not the ones we created
  // to access those we will have to write user

  const passwordstatus = await user.ispasswordCorrect(password);

  // console.log("password status is ",passwordstatus)

  if (!passwordstatus) {
    throw new ApiError(401, "in correct password");
  }
  const { accessToken, refreshToken, LoggedInUser } =
    await generateAccessTokenAndRefreshToken(user);

  // console.log(LoggedInUser)
  const safeUser = await userModel
    .findOne(LoggedInUser._id)
    .select("-password -refreshToken");

  const options = {
    //now cookies cannot be modified from the frontend
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        // here by sending the access and refereh tokens we are handling the case that user
        // himself wants to save access and refresh tokens
        {
          accessToken,
          refreshToken,
          safeUser,
        },
        "user LoggedIn successfully"
      )
    );
});

const LogoutUser = asyncHandler(async (req, res, next) => {
  //clear the cookies that are set
  // clear the refresh token.

  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      // in response we will get the user with the undefined response token
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "logged Out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const IncommingToken = req.cookies.refreshToken || req.body.refreshToken;
  console.log("Incomming token is ", IncommingToken);
  if (!IncommingToken) {
    throw new ApiError(401, "unauthorized request ");
  }
  const decodedToken = Jwt.verify(
    IncommingToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(401, "Invalid Token");
  }

  const User = await userModel.findById(decodedToken._id);
  if (!User) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  if (IncommingToken !== User.refreshToken) {
    throw new ApiError(401, "Refresh Token is Expired Or Used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(User);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "access Token Updated Successfully"
      )
    );
});

const UpdateUserPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;

  // if the user is able to change the password it means that user is logged in
  const User = await userModel.findById(req.user?._id);

  if (!User) {
    throw new ApiError(401, "Invalid request");
  }
  //checking that database password and this provided old password is same or not
  const IspasswordCorrect = await User.ispasswordCorrect(oldpassword);

  if (!IspasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  User.password = newPassword;
  await User.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  // i need both
  if (!(fullname && email)) {
    throw new ApiError(400, "fullname or email is required");
  }

  const UpdatedUser = await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname: fullname,
          email: email,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "fullname and email updated success fully"
      )
    );
});

//now updating file
//update avatar(profilepicture)
// for this function in the routes we will have to use two middleware
//verify jwt for login and multer for uplaoding file
// 
const UpdateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file.path;
  const oldavatarUrl=req.user.avatar;
console.log("old image url is ",oldavatarUrl)
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudnary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "error updating the file ");
  }

  

 const UpdatedUser= await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");
     
 const response=  await deleteFromCloudinary(oldavatarUrl)
 console.log("the image deletion response is ",response)

return res.status(200).
json(
  new ApiResponse(200,UpdatedUser,"profile picture successfullt updated")
)
});

//using same function we can update coverImage
const UpdateUserCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image  file is missing");
  }

  const coverImage = await uploadOnCloudnary(coverImageLocalPath);
  if (!coverImageLocalPath.url) {
    throw new ApiError(500, "error updating the file ");
  }

 const UpdatedUser= await userModel
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");
   
return res.status(200).
json(
  new ApiResponse(200,UpdatedUser,"cover Image successfully updated")
)
});
module.exports = {
  registerUser,
  loginUser,
  LogoutUser,
  refreshAccessToken,
  UpdateUserPassword,
  getCurrentUser,
  updateUserDetails,
  UpdateUserAvatar,
  UpdateUserCoverImage
};
