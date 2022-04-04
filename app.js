require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Variables to show messages
let forgotPassword = "";
let userLoginVariable = "";
let adminLoginVariable = "";
let registerVariable = "";

// Exported Modules
const db = require('./connection/config');
const schemas = require('./models/model');

const userSchema = schemas.user;
const adminSchema = schemas.admin;

const User = new mongoose.model("User", userSchema);
const Admin = new mongoose.model("Admin", adminSchema);

app.get("/", function(req, res) {
    res.render('home');
});

app.get("/about", function(req, res) {
    res.render('about');
});

app.get("/user-login", function(req, res) {
    res.render('login-user', { messages: userLoginVariable });
});

app.get("/admin-login", function(req, res) {
    res.render('login-admin', { messages: adminLoginVariable });
});

app.get("/register", function(req, res) {
    res.render('register', { messages: registerVariable });
});

app.get("/notice", function(req, res) {
    res.render('notice');
});

app.get("/forgot_password", function(req, res) {
    res.render('forgot_password', { messages: forgotPassword });
});

app.get("/privacy_policy", function(req, res) {
    res.render('privacy_policy');
});

app.get("/terms_of_use", function(req, res) {
    res.render('terms_service');
});

app.get("/complaint", function(req, res) {
    res.render('complaint');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is started on ${PORT}.`);
});