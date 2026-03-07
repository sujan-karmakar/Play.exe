const User = require("../models/user.js");
const Otp = require("../models/otp.js");
const { sendOtpEmail } = require("../utils/emailService");
const { createOtp, verifyOtp } = require("../utils/otpService");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    let { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        req.flash("error", "Email already in use.");
        return res.redirect("/signup");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        req.flash("error", "Username already in use.");
        return res.redirect("/signup");
    }

    const otp = await createOtp(email);

    try {
        await sendOtpEmail(email, otp, "Play.exe - Verify your email", `Your OTP for verification is: ${otp}. It expires in 5 minutes.`);
    } catch (err) {
        console.error("Error sending OTP email:", err);
        req.flash("error", "Error sending OTP email. Please try again.");
        return res.redirect("/signup");
    }

    req.session.signupData = { username, email, password };

    req.flash("success", "OTP sent to your email. Please verify.");
    res.redirect("/verify-otp");
};

module.exports.renderVerifyOtp = (req, res) => {
    res.render("users/verify-otp.ejs");
};

module.exports.verifyOtp = async (req, res, next) => {
    const { otp } = req.body;

    if (req.session.signupData) {
        const { username, email, password } = req.session.signupData;
        
        // Recent OTP for the email
        const otps = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (otps.length === 0) {
             req.flash("error", "Invalid or expired OTP.");
             return res.redirect("/verify-otp");
        }
        
        const validOtpDoc = otps[0];
        const isValid = await validOtpDoc.verifyOtp(otp);

        if (!isValid) {
            req.flash("error", "Invalid or expired OTP.");
            return res.redirect("/verify-otp");
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        await Otp.deleteMany({ email }); // Delete all OTPs for this email
        delete req.session.signupData;

        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        req.flash("success", `Welcome to Play.exe ${newUser.username}`);
        return res.redirect("/");
    } else if (req.session.tempUpdate) {
        const { userId, newEmail } = req.session.tempUpdate;
        
        const otps = await Otp.find({ email: newEmail }).sort({ createdAt: -1 }).limit(1);
        
        if (otps.length === 0) {
             req.flash("error", "Invalid or expired OTP.");
             return res.redirect("/verify-otp");
        }

        const validOtpDoc = otps[0];
        const isValid = await validOtpDoc.verifyOtp(otp);

        if (!isValid) {
            req.flash("error", "Invalid or expired OTP.");
            return res.redirect("/verify-otp");
        }

        const user = await User.findById(userId);
        if (user) {
            user.email = newEmail;
            await user.save();
            await Otp.deleteMany({ email: newEmail });
            delete req.session.tempUpdate;

            await new Promise((resolve, reject) => {
                req.login(user, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            req.flash("success", "Email updated successfully!");
            return res.redirect(`/users/${userId}`);
        } else {
            req.flash("error", "User not found.");
            return res.redirect("/");
        }
    } else {
        req.flash("error", "Session expired or invalid request.");
        return res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome back ${req.user.username}`);
    res.redirect(res.locals.redirectUrl || "/");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully");
        res.redirect("/");
    });
};