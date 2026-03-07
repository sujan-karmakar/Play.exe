const User = require("../models/user.js");

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

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    await new Promise((resolve, reject) => {
        req.login(registeredUser, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    req.flash("success", `Welcome to Play.exe ${registeredUser.username}`);
    return res.redirect("/");
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