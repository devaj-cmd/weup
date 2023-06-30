const bcrypt = require("bcrypt");

const { User } = require("../model/User");
const { Photo } = require("../model/Photo");
const uploadImage = require("../utils/upload.image");
const { verifyToken } = require("../libs/verify.token");

const checkDuplicateEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });

    if (user) {
      res.status(400).json({ message: "User with email already exists." });
    } else {
      res.status(200).json({ message: "User not found" });
    }
  } catch (error) {
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with default preferences
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      dob,
      status: "pending",
      my_interests,
      interested_gender,
      preferences: {
        age: [],
        distance: 0,
        ethnicity: [],
        relationship_goals: [],
        smoking: "",
        drinking: "",
      },
    });

    // Save the user to the database
    const user = await newUser.save();

    // Remove the password property from the user object
    delete user.password;

    // Return the user object without the password
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
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

    // Fetch the photos associated with the user
    const photosToAdd = await Photo.find({ user: userId });

    // Assign the fetched photos to the user object
    userToSend.photos = photosToAdd;

    const photoToSend = userToSend.photos.map((photo) => photo.imageUrl);
    const { photos, ...userDetails } = userToSend.toObject();

    res.status(200).send({ photos: photoToSend, ...userDetails }); // Send the updated user object back as the response
  } catch (error) {
    console.log(error);
    res.status(500).send("Error uploading photos: " + error);
  }
};

const verifyOtherServices = async (req, res) => {
  try {
    const { token, provider, providerId } = req.body;

    // Verify the token
    const { email } = await verifyToken(token);

    console.log(email, "two");
    // Check if the user exists in the database

    // return res.sendStatus(200);
    const user = await User.findOne({ email });

    if (user) {
      // User exists, check if the provider is already linked
      const linkedProvider = user.linkedProviders.find(
        (p) => p.provider === provider && p.providerId === providerId
      );

      if (linkedProvider) {
        res
          .status(409)
          .json({ message: "Provider already linked to the user" });
      } else {
        // Provider is not linked, so add it to the user's linkedProviders array
        user.linkedProviders.push({ provider, providerId });
        await user.save();
        res.status(200).json({ message: "Provider linked successfully" });
      }
    } else {
      // User does not exist, create a new account for the provider
      const newUser = new User({
        name: "Your Name",
        email,
        linkedProviders: [{ provider, providerId }],
      });
      await newUser.save();
      res
        .status(200)
        .json({ message: "New account created and provider linked" });
    }
  } catch (error) {
    // Token verification failed, send an error response
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = {
  checkDuplicateEmail,
  registerUser,
  upload,
  verifyOtherServices,
};
