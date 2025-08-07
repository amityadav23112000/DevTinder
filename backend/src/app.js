const express = require('express');
const { connectDB } =  require("./config/database");
const User = require("./models/user");
const {validationSignUpData, loginValidation} = require("./utils/validation");
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middleware/auth");
const cors = require("cors");


const app = express();
app.use(cors(
  { origin: "http://localhost:5173",   // Your frontend origin
  credentials: true    }             // Allow cookies/authorization headers
));
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());

const authrouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user")
;

// api for user signup (using router as middlware)
app.use("/", authrouter);
// api for user profile (using router as middleware)
app.use("/profile", profileRouter);
// api for connection request (using router as middleware)
app.use("/request", requestRouter);
// api for user profile (using router as middleware)
app.use("/user", userRouter);


// deafult api when nothing match
app.use("/", (req, res) => {
    res.send("Welcome to DevTinder API");
}
);

// logic for db connection and server start
connectDB().then(()=>{
    console.log("Database connected successfully");
    app.listen(1234,()=>{
    console.log("Server is running on port 1234");
    });
})
.catch((error) => {
    console.error("Database connection failed:", error);
}
);







