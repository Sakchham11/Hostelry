require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require('nodemailer');

// Variables to show messages
let forgotPassword = "";
let userLoginVariable = "";
let adminLoginVariable = "";
let registerVariable = "";

// Exported Modules
const db = require('./connection/config');      // dbConnection Module
const schemas = require('./models/model');      // Schema Module

const userSchema = schemas.user;
const adminSchema = schemas.admin;
const noticeSchema = schemas.notice;

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session ({
    secret: "Our Truth.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Admin = new mongoose.model("Admin", adminSchema);
const Notice = new mongoose.model("Notice", noticeSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

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

app.get("/dashboard", function(req, res) {
    if(req.isAuthenticated()) {
        res.render("dashboard");
    }
    else res.redirect("/user-login");
});

app.get("/panel", function(req, res) {
    if(req.isAuthenticated()) {
        res.render("panel");
    }
    else res.redirect("/admin-login");
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/user-login");
});

app.post("/register", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if(password.length >= 6) {
        User.findOne({username: username}, function(err, foundRegisterUser) {
            if(err) console.log(err);
            else {
                if(foundRegisterUser) {
                    registerVariable = "Email is already registered!";
                    res.render("register", {messages: registerVariable});
                    registerVariable = "";
                } else {
                    User.register({username: username}, password, function(err, user) {
                        if(err) {
                            console.log(err);
                            res.redirect("/register");
                        } else {
                            passport.authenticate("local") (req, res, function() {
                                userLoginVariable = "Registered Successfully, Please login here!";
                                res.render("login-user", {messages: userLoginVariable});
                                userLoginVariable = "";
                            })
                        }
                    });
                }
            }
        });
    } else {
        registerVariable = "Password should be at least 6 characters long!";
        res.render("register", { messages: registerVariable});
        registerVariable = "";
    }
});

app.post("/user-login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if(password.length >= 6) {
        User.findOne({username: username}, function(err, registeredUser) {
            if(err) {
                console.log(err);
                res.redirect("/user-login");
            } else {
                if(registeredUser) {
                    const user = new User({username: req.body.username, password: req.body.password});
                    req.login(user, function(err) {
                        if(err) {
                            console.log(err);
                            res.redirect("/user-login");
                        } else {
                            passport.authenticate("local") (req, res, function(err) {
                                if(err) res.send("Password is incorrect!");
                                else res.redirect("/dashboard");
                            });
                        }
                    });
                } else {
                    userLoginVariable = "Email is not registered!";
                    res.render("login-user", { messages: userLoginVariable });
                    userLoginVariable = "";
                }
            }
        });
    } else {
        userLoginVariable = "Password should be at least 6 characters long!";
        res.render("login-user", { messages: userLoginVariable });
        userLoginVariable = "";
    }
});

app.post("/admin-login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if(password.length >= 6) {
        Admin.findOne({username: username}, function(err, registeredAdmin) {
            if(err) {
                console.log(err);
                res.redirect("/admin-login");
            } else {
                if(registeredAdmin) {
                    const admin = new Admin({username: req.body.username, password: req.body.password});
                    req.login(admin, function(err) {
                        if(err) {
                            console.log(err);
                            res.redirect("/admin-login");
                        } else {
                            passport.authenticate("local") (req, res, function(err) {
                                if(err) res.send("Password is incorrect!");
                                else res.redirect("/panel");
                            });
                        }
                    });
                } else {
                    adminLoginVariable = "Admin is not registered!";
                    res.render("login-admin", { messages: adminLoginVariable});
                    adminLoginVariable = "";
                }
            }
        });
    } else {
        adminLoginVariable = "Password should be at least 6 characters long!";
        res.render("login-admin", { messages: adminLoginVariable});
        adminLoginVariable = "";
    }
});

app.post("/forgot_password", function(req, res) {
    const forgotMail = req.body.username;
    User.findOne({username: forgotMail}, function(err, foundMail) {
        if(err) console.log(err);
        else {
            if(foundMail) {
                forgotPassword = "Mail Found!";
                res.render("forgot_password", { messages: forgotPassword });
                forgotPassword = "";
            } else {
                forgotPassword = "Not registered yet! Please enter registered Mail!";
                res.render("forgot_password", { messages: forgotPassword });
                forgotPassword = "";
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is started on ${PORT}.`);
});  