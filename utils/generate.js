const generateOtp = (num = 4) => {
  let otp = "";
  for (let i = 0; i < num; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = {
  generateOtp,
};
