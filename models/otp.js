const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const otpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 
    }
});

otpSchema.pre("save", async function(next) {
    if (!this.isModified("otp")) return;
    this.otp = await bcrypt.hash(this.otp, 12);
});

otpSchema.methods.verifyOtp = async function(candidateOtp) {
    return await bcrypt.compare(candidateOtp, this.otp);
};

module.exports = mongoose.model("Otp", otpSchema);