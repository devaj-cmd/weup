const controller = require("../controller/signup.controller");
const signUpRoute = require("express").Router();

signUpRoute.post("/checkemail", controller.checkDuplicateEmail);

signUpRoute.post("/checkphone", controller.checkDuplicatePhoneNumber);

signUpRoute.post("/register", controller.registerUser);

signUpRoute.post(
  "/register/other-services",
  controller.registerUserWithOtherServices
);

signUpRoute.post("/upload", controller.upload);

signUpRoute.post("/verify-token", controller.verifyOtherServices);

signUpRoute.post("/verify-otp", controller.verifyOtp);

module.exports = signUpRoute;
