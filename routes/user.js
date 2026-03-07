const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl, isAccountOwner } = require("../middleware.js"); 
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const userController = require("../controllers/user.js");
const authController = require("../controllers/authController");


router.route("/signup")
.get(authController.renderSignupForm)
.post(wrapAsync(authController.signup));

router.route("/verify-otp")
.get(authController.renderVerifyOtp)
.post(wrapAsync(authController.verifyOtp));

router.route("/login")
.get(authController.renderLoginForm)
.post(
    savedRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    wrapAsync(authController.login),
);

router.get("/logout", authController.logout);

// User Search Route
router.get('/users/search', wrapAsync(userController.searchUser));

// User Profile Routes
router.get('/users/:id', wrapAsync(userController.renderProfile));

router.get('/users/:id/edit', isAccountOwner, wrapAsync(userController.renderEditForm));

router.put('/users/:id', isAccountOwner, wrapAsync(userController.updateProfile));

router.delete('/users/:id', isAccountOwner, wrapAsync(userController.deleteAccount));


module.exports = router;

