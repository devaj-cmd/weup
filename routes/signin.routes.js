const controller = require("../controller/signin.controller");
const signInRoute = require("express").Router();

signInRoute.post("/signin", controller.signInWithEmail);

signInRoute.post("/verify-number", controller.verifyPhoneNumber);

signInRoute.post("/other-services", controller.sigInWithOtherServices);

module.exports = signInRoute;
