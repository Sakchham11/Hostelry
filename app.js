require('dotenv').config();
const express = require('express');
const ejs = require('ejs');

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    res.render('home');
});

app.get("/about", function(req, res) {
    res.render('about');
});

app.get("/login", function(req, res) {
    res.render('login');
});

app.get("/register", function(req, res) {
    res.render('register');
});

app.get("/notice", function(req, res) {
    res.render('notice');
});

app.get("/complaint", function(req, res) {
    res.render('complaint');
});

// app.get("/", function(req, res) {
//     res.render('home');
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is started on ${PORT}.`);
});