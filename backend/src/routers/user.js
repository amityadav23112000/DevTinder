const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

// Middleware to get user profile
userRouter.get("/requests/received", userAuth , async(req,res)=>{
    
    try{

        const loggedInUser = req.user;
        // Find all connection requests where the logged-in user is either the sender or receiver
        const requests = await ConnectionRequest.find({
             toUserId: loggedInUser._id ,
             status : "interested"
            
        }).populate(
           "fromUserId",
           ["firstName", "lastName"]
        );
        if(requests.length === 0) {
            return res.status(404).json({message: "No connection requests found"});
        }

        res.status(200).json({requests});


    }
    catch(error){
        res.status(400).json({message: "Error fetching requests", error: error.message});

    }

});


userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Fetch accepted connections for both sender and receiver sides
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName photoUrl")
      .populate("toUserId", "firstName lastName photoUrl");

    if (connections.length === 0) {
      return res.status(404).json({ message: "No connections found" });
    }

    const data = connections.map((row) => {
      // Decide who the "other" user is
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return {
          userId: row.toUserId._id,
          firstName: row.toUserId.firstName,
          lastName: row.toUserId.lastName,
          photoUrl: row.toUserId.photoUrl,
        };
      } else {
        return {
          userId: row.fromUserId._id,
          firstName: row.fromUserId.firstName,
          lastName: row.fromUserId.lastName,
          photoUrl: row.fromUserId.photoUrl,
        };
      }
    });

    res.status(200).json({ data });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching connections", error: error.message });
  }
});



userRouter.get("/feed", userAuth, async (req, res) => {
    try{
      //user should not see their own profile in the feed
      const loggedInUser = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit =
        !isNaN(parseInt(req.query.limit)) && parseInt(req.query.limit) <= 10
          ? parseInt(req.query.limit)
          : 10;
      // Find all connection request send or received by the logged-in user
      const connections = await ConnectionRequest.find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      }).select("fromUserId toUserId"); // ✅ Fixed

      // Extract user IDs from the connections
      const hideUserFromFeed = new Set();
      connections.forEach((connection) => {
        hideUserFromFeed.add(connection.toUserId.toString());
        hideUserFromFeed.add(connection.fromUserId.toString());
      });
      const user = await User.find({
        $and: [
          { _id: { $nin: Array.from(hideUserFromFeed) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
        .select("fromUserId  toUserId firstName lastName about age gender skills photoUrl ")
        .skip((page - 1) * limit)
        .limit(limit);
      // Check if any users are found
      if (user.length === 0) {
        return res.status(404).json({ message: "No users found in the feed" });
      }
      res.status(200).json(user);
    }
    catch(error){
        res.status(400).json({message: "Error fetching feed", error: error.message});
    }
});
module.exports = userRouter;

