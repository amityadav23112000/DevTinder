const mongoose = require('mongoose');
const validator = require('validator');
  const jwt = require("jsonwebtoken");

// Define the schema for a user
const userSchema =  new mongoose.Schema({
  firstName: {
    required: true, // This field is required // Minimum length of the string
    type: String,
    minhlength: 3, // Minimum length of the string
    maxlength: 50, // Maximum length of the string
  }, // String is shorthand for {type: String}

  lastName: {
    required: true, // This field is required // Minimum length of the string
    type: String,
  },
  email: {
    required: true, // This field is required // Minimum length of the string
    type: String,
    unique: true, // This field must be unique},
    lowercase: true, // This field is required // Minimum length of the string
    trim: true, 
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is not valid!");
        }
    }
  },
  password: {
    required: true, // This field is required // Minimum length of the string
    type: String,
    minlength: 8, // Minimum length of the string
  },

  age: Number,
  gender: {
    type:String,
    lowercase: true, // This field is required // Minimum length of the string
    validate(value){
        if(!['male', 'female','others'].includes(value)){
            throw new Error("Gender data is not valid!");
        }
    }  // validate only called when new document is inserted but not on update we have to make it work on update as well


  },
  skills: [String], // Array of strings
  about: {
    type: String,
    maxlength: 500, // Maximum length of the string
    trim: true, // Remove whitespace from both ends of the string
  },
  photoUrl: {
    type: String,
    default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAOVBMVEXy8vKZmZmWlpb19fWTk5Pu7u74+PiQkJDr6+vh4eGysrLExMSfn5+kpKTLy8urq6u5ubnX19fR0dF5huuhAAAEY0lEQVR4nO2c2xLbKgxFDQIMtvGF///YQpqcOIljEEXgmZP90PZxjZA3QlLadT/VlOwA/F8gZWuSncw2z9vsxlm3JtnJaDc745y5FFS3jfM8u+5KUFpq3emg1iQ//fTTTz/99P+WL/K0Mf5GhtYk/0l127pMjE12mLW6BBfokQvOWZD/x2AahgsUyPCH2ibBduJi2RpFC+S28L5nq1l79iYuJicbYCmz/D0wwfg7043LVo8WyFUcsuzUW1OVShkrIkghWGysSTX2sTDdg7XoWlhqSAjTPVhTJSr4/NrOqKokFmxpR/egsjWg1ISCYqJCtoNBHN5NE/2zGVZcoHyoZvJQSYtk8lmlqKEMlsm7FTUTbMke9YSidgWY8VB8Jj4/tWZArcSRUgv24/NQAy0T2jpvUAs1FBopeAJxJ1th/TzIEns6XBGqy4DiywWPjz7R7RUtYbygeYLBR0ps1LWLntBQPXmVhy/y+EReT8GG/f6qFOlIJsYrPLLUiDw/cj8Pn59DBoraEEKcGPLz6zfqPMenuS+GHXWocgrPnphKo199jP5CzoSiLV1kxvHRl8NDDhRx6YK/+Ri9U+W82pmgfiHn1OiC+vLLeSFX6LqgoSr0p/CeXqGTBw6dVYaayQsZqQqlS+hQ9dFZ0V7kfbyb9Lghik+x0Kd5EKj0Xrpz1UZGXSqTrTgfVYlXIB8qDvxSLbQnf7Dvlfp4r4iUen686rg2dZZVd7LdQcIVKNY6FvWEcnEoXn3nOj5i4+SP0A9BrM9I3uk8VMQVag3/XxRJ9apmng7VgKmD8446X5psUJ3nFPmY4VDy3Ki4bQGlY2/lBkzRnp5o8HuH6JCmbi11V+xG5rWv41C7RDKqyuLNO1S8e1Y9VCplkYO+L7UX6CWpdybq7QmCclNiP09YV2UDFcAsiL5Lbzegn83IleMWBdmqSVMLlEldO91j9auhihYoMCvLaA6HnefVqPLJBaDNOOGj9IzWNBpdMl4A0g2WoVpln1iC2cHJMlw+RrPF9e5OwPrF/Xu8vAGsUxmiOxef/i3tQUm3iKzUPuUSi5OZae+DNE44T0rG4j7tM8IFnRv64kF6SvTD1qFM1Sf3aGmC9BTndkz/PVJIbk4YpKcET016X5dQB+kpzpKqG7Ud/w6GDiu+TJHSDCuNFetjZYzzClCdxwp03bO7Q02nfcisYXoBqrPpW84WYBmqk9526silPNT3J6LPqFb63iBtYAcPndhCziJLIaivHVKJ3ystpm+ugP9BU0F9G3/n7CoXkxiPvz/I2SIrpi+7J+0MIei4xdbQEIL4YYsUsOu3haGOR7s5O4AFoQ7HJrIlUtCBUzV1qaAjp2rqUkFHbduEHjStjqaWLS++v/rcm02YIJDrI6kaW2fQZ03V6Mmwl/h4PqSsiRDrYMDbnMlTXc06g97tM2kqRa13+8zZUy4uPrx5etOq86HXrYErWKfX63+N0aQD9KnX6rNx1fnQa/UJQ2uemx6Fwh+oYjsCOt0LmgAAAABJRU5ErkJggg="
}},

{
  timestamps: true, // This will add createdAt and updatedAt fields to the schema
}
);

// Define a method to get a JWT token for the user
userSchema.methods.getJWT =  async function(){
  const user = this; // 'this' refers to the instance of the user model
  const token =  await jwt.sign({_id: user.id}, "DevTinder2311", {expiresIn: "1h"}); // Sign the token with the user's ID and a secret key
  return token;
}
// Create a model from the schema
const User = new  mongoose.model("User", userSchema);
// Export the User model  
module.exports = User;

// This model can be used to interact with the 'users' collection in the MongoDB database
