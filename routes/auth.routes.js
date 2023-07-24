const controller = require("../controller/auth.controller");
const authRoute = require("express").Router();

authRoute.post("/users", controller.getAllUsers);

authRoute.get("/user/:id", controller.getOtherUser);

authRoute.post("/user/block", controller.blockUser);

authRoute.post("/user/unblock", controller.unblockUser);

authRoute.put("/user/preference", controller.updateUserPreference);

authRoute.post("/user/likes", controller.userLikes);

authRoute.post("/user/dislikes", controller.userDislikes);

authRoute.post("/user/fav", controller.userFavorites);

authRoute.post("/user/unfav", controller.userUnfavorites);

authRoute.post("/user/send", controller.sendMessage);

authRoute.post("/user/seen", controller.updateSeenStatus);

authRoute.get("/user/allmessages/:userId", controller.getAllMessages);

authRoute.get("/user/matches/:userId", controller.getAllUserMatches);

authRoute.get(
  "/user/messages/:loggedInUserId/:userId",
  controller.getMessagesBetweenUsers
);

module.exports = authRoute;
