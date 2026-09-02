const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const requestController = require("../controllers/requestController");

requestRouter.post("/send/:status/:toUserId", userAuth, requestController.sendRequest);
requestRouter.post("/review/:status/:requestId", userAuth, requestController.reviewRequest);

module.exports = requestRouter;
