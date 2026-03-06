const express = require("express");
const app = express();
const path = require("path");

const port = 8080;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
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