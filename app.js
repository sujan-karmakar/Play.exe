const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");

const port = 8080;


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

app.get("/", (req, res) => {
    res.render('home.ejs');
});

app.get("/games/rockpaperscissors", (req, res) => {
    res.render("games/rockPaperScissorsIndex.ejs");
});
app.get("/games/simongame", (req, res) => {
    res.render("games/simonGameIndex.ejs");
});
app.get("/games/guessinggame", (req, res) => {
    res.render("games/guessingGameIndex.ejs");
});
app.get("/games/tictactoe", (req, res) => {
    res.render("games/ticTacToeIndex.ejs");
});