const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema ({
    name: String,
    email: String,
    password: String,
    uroll: String,
    croll: String,
    room: String
});

const adminSchema = new mongoose.Schema ({
    email: String,
    password: String
});

exports.user = userSchema;
exports.admin = adminSchema;