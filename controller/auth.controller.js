const { User } = require("../model/User");
const Like = require("../model/Like");
const Dislike = require("../model/Dislike");
const Match = require("../model/Matches");
const Favorite = require("../model/Favorite");
const Message = require("../model/Message");
const { calculateSimilarity, paginateResults } = require("../utils");
const { fetchUserPhotos } = require("../utils/fetch.user.photos");
const pusher = require("../libs/pusher");

const getOtherUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { loggedInUserId } = req.body;
    const { page, limit } = req.query;

    const sanitizedPage = Math.max(parseInt(page), 1) || 1;
    const sanitizedLimit = Math.max(parseInt(limit), 1) || 10;

    // Find the logged-in user by ID
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the IDs of blocked users
    const blockedUserIds = loggedInUser.blockedUsers;

    // Use the MongoDB aggregation pipeline to filter out blocked, liked, disliked, and favorite users
    const filteredUsers = await User.aggregate([
      // Left join with the Likes collection to get liked users
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "likedUserId",
          as: "likedUser",
        },
      },
      // Left join with the Dislikes collection to get disliked users
      {
        $lookup: {
          from: "dislikes",
          localField: "_id",
          foreignField: "dislikedUserId",
          as: "dislikedUser",
        },
      },

      // Match all users except the blocked users and the loggedInUser
      {
        $match: {
          _id: { $nin: [...blockedUserIds, loggedInUser._id] },
          "likedUser.loggedInUserId": { $ne: loggedInUser._id },
          "dislikedUser.loggedInUserId": { $ne: loggedInUser._id },
        },
      },
      // Project the desired fields from the user document
      {
        $project: {
          name: 1,
          email: 1,
          status: 1,
          my_interests: 1,
          dob: 1,
          gender: 1,
          interested_gender: 1,
          phoneNumber: 1,
          preferences: 1,
        },
      },
    ]);

    // Calculate similarity in batches of 10 users
    const batchSize = 10;
    const userBatches = [];
    for (let i = 0; i < filteredUsers.length; i += batchSize) {
      const batch = filteredUsers.slice(i, i + batchSize);
      const batchWithScores = await Promise.all(
        batch.map(async (user) => {
          const score = calculateSimilarity(loggedInUser, user);
          const photos = await fetchUserPhotos(user);
          const { password, ...sanitizedUser } = user;
          const userWithPhotos = { ...sanitizedUser, photos };
          return { user: userWithPhotos, score: score || 0 };
        })
      );
      userBatches.push(batchWithScores);
    }

    // Flatten the array of batches into a single array
    const flattenedUsers = userBatches.flat();

    // Sort the users based on their similarity scores in descending order
    flattenedUsers.sort((a, b) => b.score - a.score);

    // Paginate the results
    const paginatedUsers = paginateResults(
      flattenedUsers,
      sanitizedPage,
      sanitizedLimit
    );

    res.status(200).json(paginatedUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId, blockedUserId } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user to be blocked exists
    const blockedUser = await User.findById(blockedUserId);

    if (!blockedUser) {
      return res.status(404).json({ message: "Blocked user not found" });
    }

    // Add the blockedUserId to the user's blockedUsers array
    user.blockedUsers.push(blockedUserId);

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.json({ message: "User blocked successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserPreference = async (req, res) => {
  try {
    const { loggedInUserId, preferences } = req.body;

    // Find the user by userId
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's preferences
    loggedInUser.preferences = {
      ...loggedInUser.preferences,
      ...preferences,
    };

    // Save the updated user to the database
    const updatedUser = await loggedInUser.save();

    // Remove the password field from the user object
    const { password, ...sanitizedUser } = updatedUser.toObject();

    res.json({ message: "User preferences updated", user: sanitizedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const loggedInUserId = req.body.loggedInUserId; // Assuming you have implemented authentication and the logged-in user's ID is available in req.user._id
    const userIdToUnblock = req.body.userId;

    // Find the logged-in user and remove the blocked user from the blockedUsers array
    const loggedInUser = await User.findById(loggedInUserId);
    const index = loggedInUser.blockedUsers.indexOf(userIdToUnblock);
    if (index > -1) {
      loggedInUser.blockedUsers.splice(index, 1);
      await loggedInUser.save();
      res.status(200).json({ message: "User unblocked successfully" });
    } else {
      res.status(400).json({ message: "User not found in blocked list" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const userLikes = async (req, res) => {
  try {
    const { loggedInUserId, likedUserId } = req.body;

    // Check if the like relationship already exists
    const existingLike = await Like.findOne({
      loggedInUserId,
      likedUserId,
    });

    if (existingLike) {
      // If the like relationship exists, send a response indicating that it's already liked
      return res.status(200).json({ message: "Already liked!" });
    }

    // If the like relationship doesn't exist, create it (like)
    const like = await Like.create({
      loggedInUserId,
      likedUserId,
    });

    // Check if there's a match
    const existingMatch = await Like.findOne({
      loggedInUserId: likedUserId,
      likedUserId: loggedInUserId,
    });

    if (existingMatch) {
      // Create a new Match document if a match is found
      await Match.create({
        loggedInUserId,
        userId: likedUserId, // Use userId instead of likedUserId
      });

      // Send a response indicating that it's a match
      return res.status(200).json({ message: "It's a match!" });
    }

    // Send a response indicating a successful like
    res.status(200).json({ message: "Liked successfully!", like });
  } catch (error) {
    console.error("Error handling userLikes:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const userFavorites = async (req, res) => {
  try {
    const { loggedInUserId, favoriteUserId } = req.body;

    // Check if the favorite relationship already exists
    const existingFavorite = await Favorite.findOne({
      loggedInUserId,
      favoriteUserId,
    });

    if (existingFavorite) {
      return res.status(200).json({ message: "User is already favorited." });
    }

    // If the favorite relationship doesn't exist, create it (favorite)
    const fav = await Favorite.create({
      loggedInUserId,
      favoriteUserId,
    });

    res.status(200).json({ message: "User favorited successfully.", fav });
  } catch (error) {
    console.error("Error handling userFavorites:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const userUnfavorites = async (req, res) => {
  try {
    const { loggedInUserId, favoriteUserId } = req.body;

    // Check if the favorite relationship exists
    const existingFavorite = await Favorite.findOne({
      loggedInUserId,
      favoriteUserId,
    });

    if (!existingFavorite) {
      return res.status(200).json({ message: "User is not favorited." });
    }

    // If the favorite relationship exists, remove it (unfavorite)
    await Favorite.findOneAndDelete({
      loggedInUserId,
      favoriteUserId,
    });

    res.status(200).json({ message: "User unfavorited successfully." });
  } catch (error) {
    console.error("Error handling userUnfavorites:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const userDislikes = async (req, res) => {
  try {
    const { loggedInUserId, dislikedUserId } = req.body;

    // Check if the dislike relationship already exists
    const existingDislike = await Dislike.findOne({
      loggedInUserId,
      dislikedUserId,
    });

    if (existingDislike) {
      return res.status(200).json({ message: "User is already disliked." });
    }

    // Check if the favorite relationship exists, and if so, remove it (since we are disliking the user now)
    await Favorite.findOneAndDelete({
      loggedInUserId,
      favoriteUserId: dislikedUserId,
    });

    // If the dislike relationship doesn't exist, create it (dislike)
    const dislike = await Dislike.create({
      loggedInUserId,
      dislikedUserId,
    });

    res.status(200).json({ message: "User disliked successfully.", dislike });
  } catch (error) {
    console.error("Error handling userDislikes:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Check if there's a match between the sender and receiver
    const existingMatch = await Match.findOne({
      $or: [
        { loggedInUserId: senderId, userId: receiverId },
        { loggedInUserId: receiverId, userId: senderId },
      ],
    });

    if (!existingMatch) {
      // If no match is found, respond with an error
      return res
        .status(400)
        .json({ error: "Match required to send a message." });
    }

    // Create a new message
    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    pusher.trigger("messages", "new-message", message);

    res.status(200).json({ message: "Message sent successfully.", message });
  } catch (error) {
    console.error("Error handling sendMessage:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const updateSeenStatus = async (req, res) => {
  try {
    const { userId, messageId } = req.body;

    // Find the specified message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the message belongs to the specified user
    if (
      !message.senderId.equals(userId) &&
      !message.receiverId.equals(userId)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find all messages before and including the specified message
    const messagesToUpdate = await Message.find({
      $or: [
        {
          $and: [
            { receiverId: userId },
            { createdAt: { $lte: message.createdAt } }, // Use $lte to include the message with messageId
          ],
        },
        {
          $and: [
            { senderId: userId },
            { createdAt: { $lte: message.createdAt } }, // Use $lte to include the message with messageId
          ],
        },
      ],
    });

    // Update seen status for all messages in the messagesToUpdate array
    for (const msg of messagesToUpdate) {
      if (!msg.seen && msg.receiverId.equals(userId)) {
        console.log(msg);
        msg.seen = true;
        await msg.save();
      }
    }

    // Trigger the 'message-seen' event to notify the frontend
    pusher.trigger("messages", "message-seen", {
      userId: userId,
      messageId: messageId,
    });

    res.status(200).json({ message: "Seen status updated successfully." });
  } catch (error) {
    console.error("Error updating seen status:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // Merge the seen status with the messages
    const messagesWithSeenStatus = messages.map((message) => {
      return { ...message._doc, seen: message.seen };
    });

    // Send the response with all messages and their seen status
    res.status(200).json({ messages: messagesWithSeenStatus });
  } catch (error) {
    console.error("Error getting all messages:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const getAllUserMatches = async (req, res) => {
  try {
    const loggedInUserId = req.body.loggedInUserId || req.params.userId;

    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const matches = await Match.find({
      $or: [{ loggedInUserId: loggedInUser._id }, { userId: loggedInUser._id }],
    }).populate("loggedInUserId userId", "createdAt");

    const matchedUserIds = matches.map((match) =>
      match.loggedInUserId.equals(loggedInUser._id)
        ? match.userId
        : match.loggedInUserId
    );

    const matchedUsers = await User.find({
      _id: { $in: matchedUserIds },
    }).select("-password");

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInUser._id },
            { receiverId: loggedInUser._id },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUser._id] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$lastMessage",
        },
      },
    ]);

    const matchedUsersWithLastMessages = matchedUsers.map((user) => {
      const match = matches.find(
        (match) =>
          (match.loggedInUserId.equals(loggedInUser._id) &&
            match.userId.equals(user._id)) ||
          (match.loggedInUserId.equals(user._id) &&
            match.userId.equals(loggedInUser._id))
      );

      const lastMessage = lastMessages.find(
        (message) =>
          message.receiverId.toString() === user._id.toString() ||
          message.senderId.toString() === user._id.toString()
      );

      return {
        user,
        lastMessage: lastMessage
          ? { ...lastMessage, seen: lastMessage.seen }
          : {
              content: "Say Hi!",
              seen: false,
              createdAt: match.createdAt, // Use match's createdAt when no lastMessage
            },
      };
    });

    // Sort matchedUsersWithLastMessages based on lastMessage.createdAt
    matchedUsersWithLastMessages.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) {
        return 0;
      } else if (!a.lastMessage) {
        return 1;
      } else if (!b.lastMessage) {
        return -1;
      } else {
        return (
          new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
      }
    });

    res.status(200).json({ matches: matchedUsersWithLastMessages });
  } catch (err) {
    console.error("Error fetching user matches:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { loggedInUserId, userId } = req.params;

    // Fetch all messages between user1 and user2
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: userId },
        { senderId: userId, receiverId: loggedInUserId },
      ],
    });

    // Send the response with all messages and their seen status
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting messages between users:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {
  getOtherUser,
  getAllUsers,
  blockUser,
  updateUserPreference,
  unblockUser,
  userLikes,
  userFavorites,
  userUnfavorites,
  userDislikes,
  sendMessage,
  updateSeenStatus,
  getAllMessages,
  getMessagesBetweenUsers,
  getAllUserMatches,
};
