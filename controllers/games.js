const User = require("../models/user");

module.exports.updateScore = async (req, res) => {
    // Only logged in users can update scores
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Please log in to save your score." });
    }

    const { game, score } = req.body;
    
    // Validate score is a number
    if (isNaN(parseInt(score))) {
        return res.status(400).json({ error: "Invalid score value" });
    }
    
    // Validate game name
    const allowedGames = ["ticTacToe", "simonGame", "guessingGame", "rockPaperScissors"];
    if (!allowedGames.includes(game)) {
        return res.status(400).json({ error: "Invalid game name" });
    }

    try {
        const user = await User.findById(req.user._id);



        
        const now = new Date();
        const lastUpdate = user.updatedAt ? new Date(user.updatedAt) : new Date(0);
        if ((now - lastUpdate) < 1000) { 
            return res.status(429).json({ error: "Please wait before updating score again." });
        }

        const currentScore = user.points[game] || 0;
        const newScore = parseInt(score);

        if (game === "ticTacToe" || game === "rockPaperScissors") {
            if (newScore > currentScore + 2) {
                 return res.status(400).json({ error: "Suspicious score increase detected." });
            }
        } else if (game === "simonGame") {
            if (newScore > 60) {
                 return res.status(400).json({ error: "Score exceeds maximum possible limit." });
            }
        } else if (game === "guessingGame") {
             if (newScore > 25) {
                 return res.status(400).json({ error: "Score exceeds maximum possible limit." });
             }
        }

        if (typeof user.points[game] === 'undefined') {
            user.points[game] = 0;
        }

        
        
        if (parseInt(score) > user.points[game]) {
            user.points[game] = parseInt(score);
        }

        await user.save();
        
        res.json({ 
            success: true, 
            message: "Score updated successfully", 
            totalScore: user.points[game] 
        });
    } catch (err) {
        console.error("Score update error:", err);
        res.status(500).json({ error: "Failed to update score" });
    }
};

module.exports.ticTacToe = (req, res) => {
    res.render("games/ticTacToeIndex.ejs");
}

module.exports.simonGame = (req, res) => {
    res.render("games/simonGameIndex.ejs");
}

module.exports.guessingGame = (req, res) => {
    res.render("games/guessingGameIndex.ejs");
}

module.exports.rockPaperScissors = (req, res) => {
    res.render("games/rockPaperScissorsIndex.ejs");
}