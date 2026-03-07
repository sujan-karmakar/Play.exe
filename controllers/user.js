const User = require("../models/user.js");
const Otp = require("../models/otp.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

    try {
        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
        await Otp.create({ email, otp });

        req.session.signupData = { username, email, password };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Play.exe - Verify your email",
            text: `Your OTP for verification is: ${otp}. It expires in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        req.flash("success", "OTP sent to your email. Please verify.");
        res.redirect("/verify-otp");
    } catch (err) {
        console.error("Error sending OTP:", err);
        req.flash("error", "Failed to send OTP. Please try again.");
        res.redirect("/signup");
    }
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

        try {
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);
             await Otp.deleteMany({ email }); // Delete all OTPs for this email
            delete req.session.signupData;

            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", `Welcome to Play.exe ${newUser.username}`);
                res.redirect("/");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
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

        try {
            const user = await User.findById(userId);
            if (user) {
                user.email = newEmail;
                await user.save();
                await Otp.deleteMany({ email: newEmail });
                delete req.session.tempUpdate;

                req.login(user, (err) => {
                    if (err) {
                        req.flash("error", "Error re-logging in");
                        return res.redirect(`/users/${userId}`);
                    }
                    req.flash("success", "Email updated successfully!");
                    res.redirect(`/users/${userId}`);
                });
            } else {
                req.flash("error", "User not found.");
                res.redirect("/");
            }
        } catch (e) {
            console.error(e);
            req.flash("error", "Error updating email.");
            res.redirect(`/users/${userId}/edit`);
        }
    } else {
        req.flash("error", "Session expired or invalid request.");
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Play.exe!");
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/");
    })
};

module.exports.renderProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
        req.flash('error', 'User not found!');
        return res.redirect('/');
    }

    
    //Total Score Calculation 
    const userTotalScore = (user.points.guessingGame || 0) + 
                           (user.points.ticTacToe || 0) + 
                           (user.points.simonGame || 0) + 
                           (user.points.rockPaperScissors || 0);

    //Global Rank 
    const globalRankData = await User.aggregate([
        {
            $addFields: {
                totalScore: {
                    $add: [
                        { $ifNull: ['$points.guessingGame', 0] },
                        { $ifNull: ['$points.ticTacToe', 0] },
                        { $ifNull: ['$points.simonGame', 0] },
                        { $ifNull: ['$points.rockPaperScissors', 0] }
                    ]
                }
            }
        },
        { $match: { totalScore: { $gt: userTotalScore } } },
        { $count: 'rank' }
    ]);

    const globalRank = (globalRankData.length > 0 ? globalRankData[0].rank : 0) + 1;

    //Game Ranks
    const countHigher = async (gameField) => {
        const score = user.points[gameField] || 0;
        let query = {};
        query['points.' + gameField] = { $gt: score };
        const count = await User.countDocuments(query);
        return count + 1;
    };

    const ranks = {
        ticTacToe: await countHigher('ticTacToe'),
        rockPaperScissors: await countHigher('rockPaperScissors'),
        simonGame: await countHigher('simonGame'),
        guessingGame: await countHigher('guessingGame')
    };

    res.render('users/show.ejs', { user, totalScore: userTotalScore, globalRank, ranks });
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
    const { username, email, password } = req.body;
    
    // We cannot proceed without password
    if (!password) {
        req.flash('error', 'Password is required to update profile.');
        return res.redirect(`/users/${id}/edit`);
    }

    try {
        const user = await User.findById(id);
        
        // Use promisified authentication if possible, or wrap it
        // Since passport-local-mongoose authenticate does not support Promise directly in a convenient way for result, we wrap it manually or use callback carefully.
        // Let's use clean callback structure, ensuring all paths return.
        
        user.authenticate(password, async (err, result, passwordErr) => {
            if (err || passwordErr || !result) {
                req.flash('error', 'Incorrect Password. Changes not saved.');
                return res.redirect(`/users/${id}/edit`);
            }

            try {
                if (username && username !== user.username) {
                    user.username = username;
                    await user.save();
                }

                if (email && email !== user.email) {
                    const existingUser = await User.findOne({ email });
                    if (existingUser) {
                        req.flash('error', 'Email already in use.');
                        return res.redirect(`/users/${id}/edit`);
                    }

                    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
                    await Otp.create({ email, otp });

                    req.session.tempUpdate = { userId: id, newEmail: email };

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Play.exe - Verify your email update",
                        text: `Your OTP for email update is: ${otp}. It expires in 5 minutes.`,
                    };
                    
                    await transporter.sendMail(mailOptions);
                    req.flash("success", "OTP sent to new email. Please verify.");
                    return res.redirect("/verify-otp");
                }
                
                // If email didn't change (or username did), finalize here
                req.login(user, (loginErr) => {
                    if (loginErr) {
                        console.error("Login error during update:", loginErr);
                        req.flash('error', 'Error re-logging in');
                        return res.redirect(`/users/${id}`); 
                    }
                    req.flash('success', 'Profile updated successfully!');
                    return res.redirect(`/users/${id}`);
                });

            } catch (innerError) {
                console.error("Update profile error:", innerError);
                req.flash("error", "An error occurred while updating profile.");
                return res.redirect(`/users/${id}/edit`);
            }
        });
    } catch (outerError) {
        console.error("User lookup error:", outerError);
        req.flash("error", "User not found.");
        return res.redirect("/");
    }
};

module.exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Account deleted successfully.');
    res.redirect('/');
};


module.exports.searchUser = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        req.flash('error', 'Please enter a username to search.');
        return res.redirect('/');
    }
    
    const user = await User.findOne({ username: username });
    
    if (!user) {
        req.flash('error', 'User not found!');
        return res.redirect('/');
    }
    res.redirect(`/users/${user._id}`);
};

