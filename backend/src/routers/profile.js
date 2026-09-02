const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const profileController = require("../controllers/profileController");

profileRouter.get("/view", userAuth, profileController.viewProfile);
profileRouter.patch("/edit", userAuth, profileController.editProfile);
profileRouter.post("/photo/presign", userAuth, profileController.presignPhotoUpload);
profileRouter.patch("/photo", userAuth, profileController.confirmPhotoUpload);

module.exports = profileRouter;
