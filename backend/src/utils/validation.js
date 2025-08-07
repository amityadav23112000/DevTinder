const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Adjust the path as necessary

const  validationSignUpData =(req)=>{
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        throw new Error("All fields are required");
    }
    if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        throw new Error("First name and last name must be strings");
    }
    if( !validator.isEmail(email)) {
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number");
    
    }
}

const loginValidation = async (req) => {
  const { email, password } = req.body;
  console.log(req.body);
  // Check if email and password are provided

  // Step 1: Check if email and password are provided
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Step 2: Find the user by email
  const user = await User.findOne({ email }); // Use findOne instead of find
  if (!user) {
    throw new Error("User not found");
  }

  // Step 3: Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  req.user = user; // Attach user to the request object for further use
  // Step 4: All checks passed
  return true;
};

const profileEditValidation =  async (req) => {
       const _id = req.body._id;
       const data = req.body;
      try{
         // Validate the data before updating
         const allowedEditFields= ["firstName","lastName","about","gender","age","skills"];
         const updates = Object.keys(data);
          // Remove _id from updates to prevent it from being edited
          if (updates.includes('_id')) {
            updates.splice(updates.indexOf('_id'), 1);
          }
          // Check if the updates are valid
         const isValidOperation = updates.every((update) => allowedEditFields.includes(update));
        if (!isValidOperation) {
                throw new Error("Invalid updates!");
          }
       //  Find the user by ID and update their firstName
        const user = await User.findByIdAndUpdate(_id, data, {
          new: true,
          runValidators: true,
        });
       req.user = user; 
       }
      catch(error){
          throw new Error("Error updating user: " + error.message);
      }
};


module.exports = {
    validationSignUpData,
    loginValidation,
    profileEditValidation,

};
// This function validates the signup data
// It checks if all required fields are present and valid
// It throws an error if any validation fails


