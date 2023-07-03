require("dotenv").config();
const jwt = require("jsonwebtoken");

// Function to generate an authentication token and a refresh token
const generateAuthTokens = (user) => {
  // Define the payload for the tokens
  const payload = {
    userId: user._id,
    email: user.email,
    // Add any additional data you want to include in the tokens
  };

  // Generate the authentication token
  const authToken = jwt.sign(payload, process.env.MY_AUTH_TOKEN_SECRET_KEY, {
    expiresIn: "15m",
  });

  // Generate the refresh token
  const refreshToken = jwt.sign(
    payload,
    process.env.MY_AUTH_REFRESH_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  return { authToken, refreshToken };
};

module.exports = generateAuthTokens;
