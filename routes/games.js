const express = require("express");
const router = express.Router();

const gamesController = require("../controllers/games.js");

router.get("/rockpaperscissors", gamesController.rockPaperScissors);
router.get("/tictactoe", gamesController.ticTacToe);
router.get("/simongame", gamesController.simonGame);
router.get("/guessinggame", gamesController.guessingGame);
router.post("/updateUserScore", gamesController.updateScore);
module.exports = router;