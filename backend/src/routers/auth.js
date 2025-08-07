const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const {validationSignUpData, loginValidation} = require("../utils/validation");
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const {userAuth} = require("../middleware/auth");


// api for user signup
authRouter.post("/signup", async (req,res)=>{
    // /validate the request body
    try{
    
      validationSignUpData(req);
    // encrypting password
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user= new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash, // Store the hashed password
        age: req.body.age,
        skills: req.body.skills,
        about: req.body.about,
    })
    console.log(user);
     // user info save in db
        await user.save();
        res.status(201).json({message: "User created successfully"});
    }
    catch(error){
        res.status(400).json({message: "Error creating user", error: error.message});
    }
    }
);

// api for user login
authRouter.post("/login", async (req, res) => {
    try {
      const valid = await loginValidation(req);
        if(valid){
           const token = await req.user.getJWT(); 
           res.cookie("token", token);
           res.status(200).json(req.user);
        }
    }
    catch(error){
       res.status(400).json({ message: "Invalid login", error: error.message });
    }
}
);

authRouter.post("/logout", (req, res) => {
  try {
   res.cookie("token", "", {
      path: '/',                 // default path
      httpOnly: false,           // match login (was not httpOnly)
      secure: false,             // match default
      sameSite: 'Lax',           // match default
      expires: new Date(0)       // expire immediately
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ message: "Error logging out", error: error.message });
  }
});







module.exports = authRouter;
