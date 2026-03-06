const User = require("../models/user");

module.exports.updateScore = async (req, res) => {
    // Only logged in users can update scores
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Please log in to save your score." });
    }

    const { game, score } = req.body;
    
    // Validate game name
    const allowedGames = ["ticTacToe", "simonGame", "guessingGame", "rockPaperScissors"];
    if (!allowedGames.includes(game)) {
        return res.status(400).json({ error: "Invalid game name" });
    }

    try {
        const user = await User.findById(req.user._id);
        
        if (typeof user.points[game] === 'undefined') {
            user.points[game] = 0;
        }

        // Universal Highest Score Logic:
        // Update only if the new session score is higher than the stored best score
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