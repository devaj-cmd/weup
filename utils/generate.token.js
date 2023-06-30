const jwt = require("jsonwebtoken");

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export { generateToken };
