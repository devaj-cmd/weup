const bcrypt = require("bcrypt");
const { User } = require("../model/User");
const { Photo } = require("../model/Photo");
const uploadImage = require("../utils/upload.image");
const { verifyToken } = require("../libs/verify.token");
const { generateAndSendOTP, verifyOTP } = require("../utils/generate");
const {
  fetchUserPhotosAndSendResponse,
} = require("../utils/fetch.user.photos");
const createLogger = require("../utils/logger");

const logger = createLogger("error.log");

const checkDuplicateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if an existing user with the same email exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      res.status(400).json({ message: "User with email already exists." });
    } else {
      await generateAndSendOTP(email);

      res.status(200).json({ message: "OTP sent successfully." });
    }
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(500).json({ message: "Error on the server." });
  }
};

const checkDuplicatePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const formattedPhoneNumber = `+${phoneNumber}`;

    // Check if the phone number already exists in the database
    const existingUser = await User.findOne({
      phoneNumber: formattedPhoneNumber,
    });

    if (existingUser) {
      // User with the phone number already exists
      res
        .status(400)
        .json({ message: "User with phone number already exists." });
    } else {
      // Phone number is unique
      res.status(200).json({ message: "Phone number is available." });
    }
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(500).json({ message: "Error on the server." });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      password,
      email,
      dob,
      my_interests,
      interested_gender,
      gender,
    } = req.body;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword =
      password !== "" && (await bcrypt.hash(password, saltRounds));

    // Create a new user with default preference
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      dob,
      status: "pending",
      my_interests,
      interested_gender,
    });

    // Save the user to the database
    const user = await newUser.save();

    // Remove the password property from the user object
    delete user.password;

    // Return the user object without the password
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerUserWithOtherServices = async (req, res) => {
  const {
    name,
    email,
    dob,
    my_interests,
    interested_gender,
    gender,
    phoneNumber,
  } = req.body.data;
  const userId = req.body.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        gender,
        dob,
        status: "pending",
        my_interests,
        interested_gender,
        phoneNumber,
      },
      { new: true }
    );

    if (updatedUser) {
      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(500).json({ message: "Error on the server" });
  }
};

const upload = async (req, res) => {
  const userId = req.body.user; // Assuming you have the user ID available in the request body
  const images = req.body.photoURIs; // Assuming you have the image data available in the request body

  try {
    // Save the photos to the database or file storage system
    const photoPromises = images.map(async (url) => {
      const imageUrl = await uploadImage(url);
      // Create a new photo
      const photo = new Photo({
        user: userId,
        imageUrl,
      });
      // Save the photo to the database
      return photo.save();
    });

    // Wait for all photo uploads to complete
    await Promise.all(photoPromises);

    // Fetch the updated user from the database
    const userToSend = await User.findById(userId).select("-password");

    fetchUserPhotosAndSendResponse(userToSend, res);
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(500).send("Error uploading photos: " + error);
  }
};

const verifyOtherServices = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const { email, name, phone_number } = await verifyToken(token);

    // console.log({ email, name, phoneNumber });

    if (email) {
      // Check if the user exists in the database by email
      const userByEmail = await User.findOne({ email });

      if (userByEmail) {
        // User already exists, prompt them to sign in
        res
          .status(409)
          .json({ message: "User already exists. Please sign in." });
      } else {
        // Create a new user in the database with the necessary details
        const newUser = new User({
          name,
          email,
        });

        // Save the new user to the database
        const createdUser = await newUser.save();

        // Send a success response
        res.status(200).json({
          message: "New user created successfully",
          user: createdUser,
        });
      }
    } else if (phone_number) {
      // Check if the user exists in the database by phoneNumber
      const userByPhoneNumber = await User.findOne({
        phoneNumber: phone_number,
      });

      if (userByPhoneNumber) {
        // User already exists, prompt them to sign in
        res
          .status(409)
          .json({ message: "User already exists. Please sign in." });
      } else {
        // Create a new user in the database with the necessary details
        const newUser = new User({
          phoneNumber: phone_number,
        });

        // Save the new user to the database
        const createdUser = await newUser.save();

        // Send a success response
        res.status(200).json({
          message: "New user created successfully",
          user: createdUser,
        });
      }
    } else {
      // Invalid token without email or phoneNumber
      res
        .status(400)
        .json({ error: "Invalid token. Please provide valid credentials." });
    }
  } catch (error) {
    logger.error("Error occurred:", error);
    // Token verification failed, send an error response
    res.status(401).json({ error: "Invalid token" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await verifyOTP(email, otp);

    res.status(200).json({ message: "OTP verification successful." });
  } catch (error) {
    logger.error("Error occurred:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  checkDuplicateEmail,
  registerUser,
  upload,
  verifyOtherServices,
  verifyOtp,
  checkDuplicatePhoneNumber,
  registerUserWithOtherServices,
};
