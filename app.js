if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const gamesRouter = require("./routes/games.js");
const userRouter = require("./routes/user.js");

const port = 8080;
const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(`Error : ${err}`);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views")); 
app.use(express.static("public"));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("Error in mongo session store.", err);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.get("/", async (req, res) => {
    try {
        const users = await User.find({}).select('username points profilePicture').lean();
        
        // Calculate total scores and format for main leaderboard
        const leaderboardData = users.map(user => {
            const p = user.points || {};
            const totalScore = (p.guessingGame || 0) + (p.ticTacToe || 0) + (p.simonGame || 0) + (p.rockPaperScissors || 0);
            return {
                username: user.username,
                totalScore: totalScore,
                _id: user._id,
                profilePicture: user.profilePicture
            };
        });

        // Sort by total score descending
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

        // Find current user's rank
        let userRank = null;
        if (req.user) {
            const rankIndex = leaderboardData.findIndex(u => u._id.equals(req.user._id));
            if (rankIndex !== -1) {
                userRank = {
                    rank: rankIndex + 1,
                    ...leaderboardData[rankIndex]
                };
            }
        }

        // Prepare top 3 for each game
        const getTop3 = (gameName) => {
            return users
                .map(u => ({ username: u.username, score: (u.points && u.points[gameName]) || 0, _id: u._id }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);
        };

        const gameLeaderboards = {
            rockPaperScissors: getTop3('rockPaperScissors'),
            simonGame: getTop3('simonGame'),
            guessingGame: getTop3('guessingGame'),
            ticTacToe: getTop3('ticTacToe')
        };

        res.render('home.ejs', { leaderboardData, userRank, gameLeaderboards });
    } catch (err) {
        console.error(err);
        res.render('home.ejs', { leaderboardData: [], userRank: null, gameLeaderboards: {} });
    }
});

//Routes
app.use("/games", gamesRouter);
app.use("/", userRouter);

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

//Page not found
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});