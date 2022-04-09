require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

let forgotEmail = "";

// For GMAIL API
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport ({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "sakchham1110@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: "HOSTELRY <sakchham1110@gmail.com>",
            to: forgotEmail,
            subject: "Forgot Password for HOSTELRY",
            text: "Forgot Password",
            html: '<div style="padding:3% 8%"><table style="width:100%;"><h1>HOSTELRY</h1><h2 style="color:#00a82d;">Change Your Password</h2><h3>We have received a password change request for your HOSTELRY account.</h3><h3 style="line-height:1.7rem;">If you did not ask to change your password, then you can ignore this email and your password will not be changed. The link below will remain active for 1 hours.</h3><a href="https://mysterious-wave-75321.herokuapp.com/change_password"><button style="background-color:#00a82d;border:1px solid #00a82d;border-radius:4px;color:#ffffff;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;padding:0 25px 0 25px;letter-spacing:.5px;min-width:150px;cursor:pointer">Reset Password</button></a></table></div>'
            // html: '<div style="padding:3% 8%"><table style="width:100%;"><h1>HOSTELRY</h1><h2 style="color:#00a82d;">Change Your Password</h2><h3>We have received a password change request for your HOSTELRY account.</h3><h3 style="line-height:1.7rem;">If you did not ask to change your password, then you can ignore this email and your password will not be changed. The link below will remain active for 1 hours.</h3><a href="http://localhost:3000/change_password"><button style="background-color:#00a82d;border:1px solid #00a82d;border-radius:4px;color:#ffffff;display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;padding:0 25px 0 25px;letter-spacing:.5px;min-width:150px;cursor:pointer">Reset Password</button></a></table></div>'
        };
        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (err) {
        return err;
    }
}



// Variables to show messages
let forgotPassword = "";
let userLoginVariable = "";
let adminLoginVariable = "";
let registerVariable = "";
let noticePanel = "";
let updateVariable = "";


let email = "";
let password = "";

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
adminSchema.plugin(passportLocalMongoose);

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
    Notice.find({}, function(err, allNotices){
        if(err) {
            console.log(err);
        } else {
            if(allNotices) {
                res.render("notice", {messages: allNotices});
            }
        }
    });
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
        User.find({username: req.user.username}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                if(user) {
                    res.render("dashboard", {messages: user});
                }
            }
        });
    }
    else res.redirect("/user-login");
});

app.get("/panel", function(req, res) {
    if(password.length >= 6) {
        Admin.findOne({username: email}, function(err, foundRegisteredAdmin) {
            if(err) {
                console.log(err);
                res.redirect("/admin-login");
            } else {
                if(foundRegisteredAdmin) {
                    if(foundRegisteredAdmin.password === password) {
                        res.render("panel", {messages: noticePanel});
                        email = ""; password = "";
                    }
                } else {
                    res.redirect("/admin-login");
                    email = "";
                    password = "";
                }
            }
        });
    } else {
        res.redirect("/admin-login");
        email = "";
        password = "";
    }
});

app.get("/update", function(req, res) {
    if(req.isAuthenticated()) {
        res.render("update", {messages: updateVariable})
    } else {
        res.redirect("/user-login");
    }
})

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/payment", function(req, res) {
    res.send("Not ready yet!");
});

app.get("/change_password", function(req, res) {
    res.render("change_password");
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
    email = req.body.username;
    password = req.body.password;
    if(password.length >= 6) {
        Admin.findOne({username: email}, function(err, foundRegisteredAdmin) {
            if(err) {
                console.log(err);
                res.redirect("/admin-login");
            } else {
                if(foundRegisteredAdmin) {
                    if(foundRegisteredAdmin.password === password) {
                        res.redirect("/panel");
                    } else {
                        adminLoginVariable = "Password is incorrect!";
                        res.render("login-admin", { messages: adminLoginVariable });
                        adminLoginVariable = "";
                    }
                } else {
                    adminLoginVariable = "Admin is not registered!";
                    res.render("login-admin", { messages: adminLoginVariable });
                    adminLoginVariable = "";
                }
            }
        });
    } else {
        adminLoginVariable = "Password should be at least 6 characters long!";
        res.render("login-admin", { messages: adminLoginVariable });
        adminLoginVariable = "";
    }
});

app.post("/panel", function(req, res) {
    const noticeTitle = req.body.noticeTitle;
    const noticeLink = req.body.noticeLink;
    var newNotice = new Notice({title: noticeTitle, link: noticeLink});
    newNotice.save(function(err) {
        if(err) {
            console.log(err);
        } else {
            noticePanel = "Successfully Inserted!";
            res.render("panel", {messages: noticePanel});
            noticePanel = "";
        }
    });
});

app.post("/forgot_password", function(req, res) {
    const forgotMail = req.body.username;
    User.findOne({username: forgotMail}, function(err, foundMail) {
        if(err) console.log(err);
        else {
            if(foundMail) {
                forgotEmail = foundMail.username;
                sendMail().then(result => {
                    console.log(result);
                    forgotPassword = "Mail Sent!";
                    res.render("forgot_password", { messages: forgotPassword });
                })
                .catch(err => console.log(err));
            } else {
                forgotPassword = "Not registered yet! Please enter registered Mail!";
                res.render("forgot_password", { messages: forgotPassword });
                forgotPassword = "";
            }
        }
    });
});

app.post("/change_password", function(req, res) {
    const newPassword = req.body.resetPassword;
    User.findOne({username: forgotEmail}, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            user.setPassword(newPassword, function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    user.save(function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect("/user-login");
                        }
                    });
                }
            });
        }
    });
});

app.post("/update", function(req, res) {
    const upgrade = { name: req.body.userName, uroll: req.body.userURoll, croll: req.body.userCRoll, hostel: req.body.userHostel, room: req.body.userRoom, batch: req.body.userBatchDetails, address: req.body.userAddress };
    if(req.isAuthenticated()) {
        User.findOneAndUpdate({username: req.user.username}, upgrade, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                user.save(function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        updateVariable = "Successfully Updated!";
                        res.render("update", {messages: updateVariable});
                        updateVariable = "";
                    }
                });
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is started on ${PORT}.`);
});  