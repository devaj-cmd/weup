const { User } = require("../model/User");
const { calculateSimilarity, paginateResults } = require("../utils");

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

    // Retrieve all users from the database
    const allUsers = await User.find();

    // Filter out blocked and logged-in user from allUsers
    const filteredUsers = allUsers
      .filter(
        (user) =>
          !blockedUserIds.includes(user._id) &&
          user._id.toString() !== loggedInUserId
      )
      .map((user) => {
        const score = calculateSimilarity(loggedInUser, user);
        const newUser = fetchUserPhotos(user);
        // Find user photo

        // Remove the password field from the user object sent
        const { password, ...sanitizedUser } = newUser.toObject();
        return { user: sanitizedUser, score: score || 0 };
      });

    // Sort the users based on their similarity scores in descending order
    filteredUsers.sort((a, b) => b.score - a.score);

    const paginatedUsers = paginateResults(
      filteredUsers,
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

module.exports = { getAllUsers, blockUser, updateUserPreference, unblockUser };
