const controller = require("../controller/auth.controller");
const authRoute = require("express").Router();

authRoute.post("/users", controller.getAllUsers);

authRoute.post("/user/block", controller.blockUser);

authRoute.post("/user/unblock", controller.unblockUser);

authRoute.put("/users/preference", controller.updateUserPreference);

module.exports = authRoute;
