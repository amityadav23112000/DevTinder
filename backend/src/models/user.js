const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");


// Define the schema for a user
const userSchema =  new mongoose.Schema({
  firstName: {
    required: true, // This field is required
    type: String,
    minlength: 3, // Minimum length of the string
    maxlength: 50, // Maximum length of the string
  }, // String is shorthand for {type: String}

  lastName: {
    required: true, // This field is required
    type: String,
  },
  email: {
    required: true, // This field is required
    type: String,
    unique: true, // This field must be unique
    lowercase: true, // Store email in lowercase
    trim: true, // Remove whitespace from both ends
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is not valid!");
        }
    }
  },
  password: {
    required: true, // This field is required
    type: String,
    minlength: 8, // Minimum length of the string
    select: false, // Don't return password by default
  },

  age: Number,
  gender: {
    type:String,
    lowercase: true, // Store gender in lowercase
    validate(value){
        if(!['male', 'female','others'].includes(value)){
            throw new Error("Gender data is not valid!");
        }
      }  // runs on save automatically; runValidators:true on updates also triggers it
  },
  
  skills: [String], // Array of strings
  organization: {
    type: String,
    trim: true,
    maxlength: 100, // Current college or company name
  },
  education: {
    type: [
      {
        degree: { type: String, trim: true, maxlength: 100 }, // e.g. "B.Tech Computer Science"
        institution: { type: String, trim: true, maxlength: 150 },
        year: { type: Number }, // graduation year
        _id: false,
      },
    ],
    default: [],
  },
  about: {
    type: String,
    maxlength: 500, // Maximum length of the string
    trim: true, // Remove whitespace from both ends of the string
  },
  // Populated only via a real upload (see photoKey below) — no hardcoded
  // default image anymore. When absent, the frontend renders a
  // gender-appropriate icon placeholder instead.
  photoUrl: {
    type: String,
  },
  // S3 object key for a user-uploaded photo. Never sent to the client directly —
  // routes resolve it to a short-lived signed URL via utils/photoUrl.js instead.
  photoKey: {
    type: String,
  },

  // Social / coding profile links — optional, only shown to accepted connections
  linkedinUrl: {
    type: String,
    trim: true,
    validate(value){
        if(value && !validator.isURL(value)){
            throw new Error("LinkedIn URL is not valid!");
        }
    }
  },
  githubUrl: {
    type: String,
    trim: true,
    validate(value){
        if(value && !validator.isURL(value)){
            throw new Error("GitHub URL is not valid!");
        }
    }
  },
  leetcodeUrl: {
    type: String,
    trim: true,
    validate(value){
        if(value && !validator.isURL(value)){
            throw new Error("LeetCode URL is not valid!");
        }
    }
  },
  codeforcesUrl: {
    type: String,
    trim: true,
    validate(value){
        if(value && !validator.isURL(value)){
            throw new Error("Codeforces URL is not valid!");
        }
    }
  },
},
{
  timestamps: true, // This will add createdAt and updatedAt fields to the schema
}
);

// Define a method to get a JWT token for the user
userSchema.methods.getJWT =  async function(){
  const user = this; // 'this' refers to the instance of the user model
  const token =  await jwt.sign({_id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"}); // Sign the token with the user's ID and a secret key
  return token;
}
// Create a model from the schema
const User = mongoose.model("User", userSchema);
// Export the User model  
module.exports = User;

// This model can be used to interact with the 'users' collection in the MongoDB database
