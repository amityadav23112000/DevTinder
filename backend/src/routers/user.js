const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const userController = require("../controllers/userController");

userRouter.get("/requests/received", userAuth, userController.getReceivedRequests);
userRouter.get("/connections", userAuth, userController.getConnections);
userRouter.get("/feed", userAuth, userController.getFeed);
userRouter.get("/recommendations", userAuth, userController.getRecommendations);

module.exports = userRouter;
