const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema ({
    name: {type: String, default: 'User'},
    email: String,
    password: String,
    uroll: {type: String, default: 'N/A'},
    croll: {type: String, default: 'N/A'},
    hostel: {type: String, default: 'N/A'},
    room: {type: String, default: 'N/A'},
    batch: {type: String, default: 'N/A'},
    address: {type: String, default: 'N/A'}
});

const adminSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const noticeSchema = new mongoose.Schema ({
    title: String,
    link: String
});

exports.user = userSchema;
exports.admin = adminSchema;
exports.notice = noticeSchema;