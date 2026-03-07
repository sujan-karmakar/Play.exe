const User = require("../models/user.js");
const { getProfileData } = require("../utils/profileService");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.searchUser = async (req, res) => {
    const searchTerm = (req.query.username || req.query.query || "").trim();

    if (!searchTerm) {
        if (req.query.username !== undefined) {
            req.flash('error', 'Enter a username to search.');
            return res.redirect('/');
        }

        return res.json([]);
    }

    if (req.query.username !== undefined) {
        const matchedUser = await User.findOne({
            username: { $regex: new RegExp(`^${escapeRegex(searchTerm)}$`, 'i') }
        }).select('_id');

        if (!matchedUser) {
            req.flash('error', 'User not found!');
            return res.redirect('/');
        }

        return res.redirect(`/users/${matchedUser._id}`);
    }

    const users = await User.find({
        username: { $regex: new RegExp(escapeRegex(searchTerm), 'i') }
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
    const usernameChanged = username && username !== req.user.username;
    const emailChanged = email && email !== req.user.email;

    if (usernameChanged) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername && !existingUsername._id.equals(req.user._id)) {
            req.flash('error', 'Username already in use.');
            return res.redirect(`/users/${id}/edit`);
        }
    }

    if (emailChanged) {
        const existingUser = await User.findOne({ email });
        if (existingUser && !existingUser._id.equals(req.user._id)) {
            req.flash('error', 'Email already in use.');
            return res.redirect(`/users/${id}/edit`);
        }
    }

    if (usernameChanged) {
        req.user.username = username;
    }

    if (emailChanged) {
        req.user.email = email;
    }

    if (req.file) {
        req.user.profilePicture = req.file.path;
    }

    if (usernameChanged || emailChanged || req.file) {
        await req.user.save();
    }

    if (usernameChanged) {
        await new Promise((resolve, reject) => {
            req.login(req.user, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    req.flash('success', 'Profile updated successfully!');
    return res.redirect(`/users/${id}`);
};

module.exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Account deleted successfully.');
    res.redirect('/');
};

