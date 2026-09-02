const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { withSignedPhotoUrls } = require("../utils/photoUrl");

// Get all pending connection requests received by the logged-in user
const getReceivedRequests = async (req, res) => {
  try {
    const loggedInUser = req.user;
    // Find all connection requests where the logged-in user is either the sender or receiver
    const requests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      ["firstName", "lastName"]
    );
    if (requests.length === 0) {
      return res.status(404).json({ message: "No connection requests found" });
    }

    res.status(200).json({ requests });
  }
  catch (error) {
    res.status(400).json({ message: "Error fetching requests", error: error.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Fetch accepted connections for both sender and receiver sides
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName photoUrl photoKey age gender about organization education skills linkedinUrl githubUrl leetcodeUrl codeforcesUrl")
      .populate("toUserId", "firstName lastName photoUrl photoKey age gender about organization education skills linkedinUrl githubUrl leetcodeUrl codeforcesUrl");

    if (connections.length === 0) {
      return res.status(404).json({ message: "No connections found" });
    }

    const data = connections.map((row) => {
      // Decide who the "other" user is
      const other = row.fromUserId._id.equals(loggedInUser._id)
        ? row.toUserId
        : row.fromUserId;

      return {
        userId: other._id,
        firstName: other.firstName,
        lastName: other.lastName,
        photoUrl: other.photoUrl,
        photoKey: other.photoKey,
        age: other.age,
        gender: other.gender,
        about: other.about,
        organization: other.organization,
        education: other.education,
        skills: other.skills,
        linkedinUrl: other.linkedinUrl,
        githubUrl: other.githubUrl,
        leetcodeUrl: other.leetcodeUrl,
        codeforcesUrl: other.codeforcesUrl,
      };
    });

    res.status(200).json({ data: await withSignedPhotoUrls(data) });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching connections", error: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    // user should not see their own profile in the feed
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit =
      !isNaN(parseInt(req.query.limit)) && parseInt(req.query.limit) <= 10
        ? parseInt(req.query.limit)
        : 10;
    // Find all connection requests sent or received by the logged-in user
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

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
      .select("firstName lastName about age gender organization education skills photoUrl photoKey")
      .skip((page - 1) * limit)
      .limit(limit);
    // Check if any users are found
    if (user.length === 0) {
      return res.status(404).json({ message: "No users found in the feed" });
    }
    res.status(200).json(await withSignedPhotoUrls(user));
  }
  catch (error) {
    res.status(400).json({ message: "Error fetching feed", error: error.message });
  }
};

module.exports = { getReceivedRequests, getConnections, getFeed };
