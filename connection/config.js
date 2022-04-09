require('dotenv').config();
const mongoose = require('mongoose');

// dotenv CONSTANTS
const password = process.env.PASSWORD;
const db = process.env.DATABASE;
const user = process.env.USER;
const clusterURL = process.env.URL;

// Database Connection URI
const uri = "mongodb+srv://" + user + ":" + password + "@" + clusterURL + db + "?retryWrites=true&w=majority";
// Localhost Connection URI
// const uri = "mongodb://localhost:27017/hostelDB";

// Connecting to the Database
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const dbConnection = mongoose.connection;
module.exports = dbConnection;