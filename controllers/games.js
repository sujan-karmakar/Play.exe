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