const mongoose = require('mongoose')

const password = "P@ssw0rd123";

// Method connection variables
function getFullUri (password, dbName) {
    return "mongodb+srv://itsmecjr:" + password 
        + "@lumitest.vyes5.mongodb.net/" + dbName + "?retryWrites=true&w=majority";
}

function connectToDb(dbName) {
    const connect_options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
    mongoose.connect(getFullUri(password, dbName), connect_options);
    mongoose.connection.on('connected', function() {
        console.log("Connected to DB...");
    })
    mongoose.connection.on('error', err => {
        console.log(err);
    });
}

function disconnectFromDb() {
    mongoose.connection.close();
}

//File Variables
const srExt = "_screen_recording.avi";
const arExt = "_audio_recording.wav";
const wrExt = "_webcam_recording.avi";

const testQnBucket = "test_admin";
const srBucket = "screen_recordings";
const arBucket = "audio_recordings";
const wrBucket = "webcam_recordings";
const ansBucket = "answers";

module.exports = {connectToDb, disconnectFromDb, srExt, arExt, wrExt, testQnBucket, srBucket, arBucket, wrBucket};
