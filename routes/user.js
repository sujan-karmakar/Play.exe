const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl, isAccountOwner } = require("../middleware.js"); // Ensure isAccountOwner is imported

const userController = require("../controllers/user.js");


router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    savedRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    wrapAsync(userController.login),
);

router.get("/logout", userController.logout);

// User Profile Routes
router.get('/users/:id', wrapAsync(userController.renderProfile));

router.get('/users/:id/edit', isAccountOwner, wrapAsync(userController.renderEditForm));

router.put('/users/:id', isAccountOwner, userController.updateProfile); // updateProfile handles its own async/await logic internally with passport callbacks

router.delete('/users/:id', isAccountOwner, wrapAsync(userController.deleteAccount));


module.exports = router;

