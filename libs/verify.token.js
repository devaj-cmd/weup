const admin = require("firebase-admin");

// Verify the token and extract user information
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        const { uid, email } = decodedToken;
        resolve({ uid, email });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = { verifyToken };
