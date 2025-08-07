const express= require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {

    const toUserId = req.params.toUserId;
    const fromUserId = req.user._id;
    const status = req.params.status;
    console.log(toUserId, fromUserId, status);

    const allowedStatuses = ["ignore", "interested"];
    // Validate the status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }
    // Check if a connection request already exists between the users
    const existingRequest = await ConnectionRequest.findOne({
    $or: [{
      fromUserId: fromUserId,
      toUserId: toUserId
    },{
      fromUserId: toUserId,
      toUserId: fromUserId
    },
     ],
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already exists between these users" });
    }

    // Validate the user IDs
    const toUser = await User.findById(toUserId);
      if(!toUser) {
        return res.status(404).json({ message: "User not found" });
      }
    // Create a new connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status: status
    });

    await connectionRequest.save();
    
    res.status(201).json({ message: "Connection request sent successfully", request: connectionRequest });


  } catch (error) {
     res.status(400).json({ message: "Error sending request", error: error.message });
  }
});


requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {

  try {
    const loggedInUser = req.user;
    const requestId = req.params.requestId;
    const status = req.params.status;
    const allowedStatuses = ["accepted", "rejected"];
    
    // Validate the status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find the connection request
    const connectionRequest = await ConnectionRequest.findById({
      _id: requestId,
      toUserId: loggedInUser._id,
      status : "interested"

    });
    // Validate the connection request
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

    // Check if the request is from the logged-in user
    if (connectionRequest.fromUserId.toString() === loggedInUser._id.toString()) {
      return res.status(400).json({
        message: "You cannot review your own connection request"
      })
    }
    
    // Update the status of the connection request
    connectionRequest.status = status;
    const data  = await connectionRequest.save();

    res.status(200).json({
      message: "Connection request updated successfully",
      request: data
    });

  } catch (error) {
     res.status(400).json({
      message: "Error updating connection request",
      error: error.message
     })
  }

});

module.exports = requestRouter;
