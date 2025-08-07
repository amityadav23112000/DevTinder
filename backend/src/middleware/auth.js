const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userAuth = async (req, res, next) => {
 try{ const { token } = req.cookies;
    if(!token) {
      res.status(401).send("Plese login first");
      return;
    }
  const decodeObj = await jwt.verify(token, "DevTinder2311");
  const {_id} = decodeObj;
  const user = await User.findById(_id);
  if(!user){
    throw new Error("user not found");
  }
  req.user =user;  // attaching user to req body
  next();
}
catch(error){
     res.status(400).send(error.message);
}

};

module.exports=
{
userAuth,
}

