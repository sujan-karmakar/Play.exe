const crypto = require("crypto");
const Otp = require("../models/otp");

module.exports.createOtp = async (email) => {
    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    await Otp.create({ email, otp });
    return otp;
};

module.exports.verifyOtp = async (email, otp) => {
    const otps = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (otps.length === 0) return false;

    const validOtpDoc = otps[0];
    return await validOtpDoc.verifyOtp(otp);
};