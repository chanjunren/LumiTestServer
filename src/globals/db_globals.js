const mongoose = require('mongoose')

const password = "P@ssw0rd123";

// Method connection variables
function getFullUri (password, dbName) {
    return "mongodb+srv://itsmecjr:" + password 
        + "@lumitest.vyes5.mongodb.net/" + dbName + "?retryWrites=true&w=majority";
}

function getConnection(dbName) {
    const connect_options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
    return mongoose.createConnection(getFullUri(password, dbName), connect_options);
}

function disconnectFromDb() {
    mongoose.connection.close();
}

//File Variables
const SR_EXT = "screenRecording.avi";
const AR_EXT = "audioRecording.wav";
const WR_EXT = "webcamRecording.avi";

const SR_BUCKET = "screen_recordings";
const AR_BUCKET = "audio_recordings";
const WR_BUCKET = "webcam_recordings";

module.exports = {getConnection, SR_EXT, AR_EXT, WR_EXT, SR_BUCKET, AR_BUCKET, WR_BUCKET};
