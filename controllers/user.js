const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", `Welcome to Play.exe ${newUser.username}`);
            res.redirect("/");
        });
    } catch (err) {
        req.flash("error", err.message);
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
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            req.flash('error', 'User not found!');
            return res.redirect('/');
        }

        // --- Calculate Ranks ---
        // 1. Total Score Calculation (Sum of all games)
        const userTotalScore = (user.points.guessingGame || 0) + 
                               (user.points.ticTacToe || 0) + 
                               (user.points.simonGame || 0) + 
                               (user.points.rockPaperScissors || 0);

        // 2. Global Rank (Count users with higher total score)
        // Aggregation to calculate total score for everyone and count
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

        // 3. Game Ranks
        const countHigher = async (gameField) => {
            const score = user.points[gameField] || 0;
            // Using computed property name for query
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

    } catch (e) {
        console.log(e);
        req.flash('error', 'Cannot load profile');
        res.redirect('/');
    }
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

module.exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    
    try {
        const user = await User.findById(id);
        
        // Use authenticate method from passport-local-mongoose
        user.authenticate(password, async (err, result, passwordErr) => {
            if (err || passwordErr || !result) {
                req.flash('error', 'Incorrect Password. Changes not saved.');
                return res.redirect(`/users/${id}/edit`);
            }

            if (username && username !== user.username) {
                user.username = username;
            }
            if (email && email !== user.email) {
                user.email = email;
            }
            
            await user.save();
            
            // Re-login to update session
            req.login(user, (err) => {
                if (err) {
                    req.flash('error', 'Error re-logging in');
                    return res.redirect(`/users/${id}`);
                }
                req.flash('success', 'Profile updated successfully!');
                res.redirect(`/users/${id}`);
            });
        });
        
    } catch(e) {
        console.log(e);
        req.flash('error', 'Update failed');
        res.redirect(`/users/${id}/edit`);
    }
};

module.exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Account deleted successfully.');
    res.redirect('/');
};

