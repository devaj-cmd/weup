const bcrypt = require("bcrypt");
const { User } = require("../model/User");
const { verifyToken } = require("../libs/verify.token");
const fetchUserPhotosAndSendResponse = require("../utils/fetch.user.photos");

const signInWithEmail = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email or Password is invalid" });
    }
    // Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(404).json({ message: "Email or Password is invalid" });
    }
    fetchUserPhotosAndSendResponse(user, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error on the server" });
  }
};

const sigInWithOtherServices = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const { email, phone_number } = await verifyToken(token);

    if (email) {
      // User exists, sign in the user
      let user = await User.findOne({ email });
      if (user) {
        fetchUserPhotosAndSendResponse(user, res);
      } else {
        res.status(404).json({ message: "User not found. Please sign up." });
      }
    } else if (phone_number) {
      // User exists, sign in the user
      let user = await User.findOne({ phoneNumber: phone_number });
      if (user) {
        fetchUserPhotosAndSendResponse(user, res);
      } else {
        res.status(404).json({ message: "User not found. Please sign up." });
      }
    } else {
      // User does not exist, handle the registration process
      res.status(404).json({ message: "User not found. Please sign up." });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const verifyPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const formattedPhoneNumber = `+${phoneNumber}`;

    // Check if the phone number exists in the database
    const existingUser = await User.findOne({
      phoneNumber: formattedPhoneNumber,
    });

    if (existingUser) {
      res.status(200).json({ message: "User with phone number exists." });
    } else {
      res
        .status(400)
        .json({ message: "User with phone number does not exists." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error on the server." });
  }
};

module.exports = {
  signInWithEmail,
  sigInWithOtherServices,
  verifyPhoneNumber,
};
