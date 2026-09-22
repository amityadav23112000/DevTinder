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

// AI-suggested connections — ranks other developers by how semantically
// similar their profile is to yours (via embeddings + Atlas Vector Search),
// not just exact skill-keyword matches.
const getRecommendations = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const limit = 5;

    // embedding is select:false, so fetch it explicitly
    const me = await User.findById(loggedInUser._id).select("+embedding");
    // Mongoose defaults array-type fields to [] (not undefined) when unset,
    // so an empty-array check is required here, not just a falsy check.
    if (!me.embedding || me.embedding.length === 0) {
      return res.status(404).json({
        message: "Add some skills and an about section to your profile first — that's what recommendations are based on.",
      });
    }

    // Same "who to hide" logic as /feed — don't recommend people already interacted with
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUserIds = new Set([loggedInUser._id.toString()]);
    connections.forEach((connection) => {
      hideUserIds.add(connection.fromUserId.toString());
      hideUserIds.add(connection.toUserId.toString());
    });

    // Ask for more candidates than we need, since some will get filtered
    // out by hideUserIds after the search runs.
    const candidates = await User.aggregate([
      {
        $vectorSearch: {
          index: "user_embedding_index",
          path: "embedding",
          queryVector: me.embedding,
          numCandidates: 100,
          limit: limit + hideUserIds.size,
        },
      },
      {
        $project: {
          firstName: 1, lastName: 1, about: 1, skills: 1, organization: 1,
          age: 1, gender: 1, photoUrl: 1, photoKey: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    const matches = candidates
      .filter((user) => !hideUserIds.has(user._id.toString()))
      .slice(0, limit);

    if (matches.length === 0) {
      return res.status(404).json({ message: "No recommendations found right now" });
    }

    // Simple, honest "why" — based on skills actually shared with you,
    // not something the AI makes up after the fact.
    const withReasons = matches.map((match) => {
      const sharedSkills = (match.skills || []).filter((skill) => me.skills?.includes(skill));
      const reason = sharedSkills.length > 0
        ? `Recommended because you both work with ${sharedSkills.slice(0, 2).join(" and ")}.`
        : "Recommended based on similar experience and interests.";
      return { ...match, matchScore: match.score, reason };
    });

    res.status(200).json({ data: await withSignedPhotoUrls(withReasons) });
  } catch (error) {
    res.status(400).json({ message: "Error fetching recommendations", error: error.message });
  }
};

module.exports = { getReceivedRequests, getConnections, getFeed, getRecommendations };
