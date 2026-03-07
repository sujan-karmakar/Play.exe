const User = require("../models/user.js");
const { getProfileData } = require("../utils/profileService");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

module.exports.searchUser = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json([]);
    }

    const users = await User.find({
        username: { $regex: query, $options: 'i' }
    }).limit(10).select('username _id');

    res.json(users);
};

module.exports.renderProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
        req.flash('error', 'User not found!');
        return res.redirect('/');
    }

    const { totalScore, globalRank, ranks } = await getProfileData(user);

    res.render('users/show.ejs', { user, totalScore, globalRank, ranks });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/');
    }
    res.render('users/edit.ejs', { user });
};

module.exports.updateProfile = async (req, res, next) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (username && username !== req.user.username) {
        req.user.username = username;
        await req.user.save();

        await new Promise((resolve, reject) => {
            req.login(req.user, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Handle profile picture upload
    if (req.file) {
        req.user.profilePicture = req.file.path;
        await req.user.save();
    }

    if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already in use.');
            return res.redirect(`/users/${id}/edit`);
        }

        const { createOtp } = require("../utils/otpService");
        const { sendOtpEmail } = require("../utils/emailService");

        const otp = await createOtp(email);

        req.session.tempUpdate = { userId: id, newEmail: email };

        await sendOtpEmail(email, otp, "Play.exe - Verify your email update", `Your OTP for email update is: ${otp}. It expires in 5 minutes.`);

        req.flash("success", "OTP sent to new email. Please verify.");
        return res.redirect("/verify-otp");
    }
    
    // If email didn't change (or username did), finalize here
    req.flash('success', 'Profile updated successfully!');
    return res.redirect(`/users/${id}`);
};

module.exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Account deleted successfully.');
    res.redirect('/');
};

