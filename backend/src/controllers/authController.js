const bcrypt = require('bcrypt');
const User = require("../models/user");
const { validationSignUpData, loginValidation } = require("../utils/validation");
const { withSignedPhotoUrl } = require("../utils/photoUrl");

const signup = async (req, res) => {
  try {
    // validate the request body
    validationSignUpData(req);
    // encrypting password
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: passwordHash, // Store the hashed password
      age: req.body.age,
      skills: req.body.skills,
      about: req.body.about,
      organization: req.body.organization,
    });
    // user info save in db
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  }
  catch (error) {
    res.status(400).json({ message: "Error creating user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const valid = await loginValidation(req);
    if (valid) {
      const token = await req.user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,                              // JS on the frontend can't read the cookie
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "Lax",
        expires: new Date(Date.now() + 60 * 60 * 1000) // matches the 1h JWT expiry
      });
      res.status(200).json(await withSignedPhotoUrl(req.user));
    }
  }
  catch (error) {
    res.status(400).json({ message: "Invalid login", error: error.message });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      path: '/',                 // default path
      httpOnly: true,            // match login
      secure: process.env.NODE_ENV === "production", // match login
      sameSite: 'Lax',           // match login
      expires: new Date(0)       // expire immediately
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ message: "Error logging out", error: error.message });
  }
};

module.exports = { signup, login, logout };
