const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const {userAuth} = require("../middleware/auth");
const {profileEditValidation} = require("../utils/validation");


profileRouter.get("/view", userAuth,(req, res) => {
  try {
      res.send(req.user);
  } catch (error) {
    res.status(401).send("error" + error);
  }
});

profileRouter.patch("/edit" ,userAuth,  async (req,res)=>{
    try{
        // Validate the data before updating
         await profileEditValidation(req);
        res.send(req.user);
    }
    catch(error){
        return res.status(400).json({ message: "Error updating user", error: error.message });
    }
});
 

module.exports = profileRouter;