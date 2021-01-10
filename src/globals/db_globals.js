const mongoose = require('mongoose')
const Admin = mongoose.mongo.Admin;

const user = "itsmecjr"
const password = "P@ssw0rd123";

const connect_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}

// Method connection variables
function getFullUri (user, password, dbName) {
    return `mongodb+srv://${user}:${password}@lumitest.vyes5.mongodb.net/${dbName}?retryWrites=true&w=majority`;
}

function getConnection(dbName) {
    return mongoose.createConnection(getFullUri(user, password, dbName), connect_options);
}

function getAllDbs() {
    return new Promise((resolve, reject) => {
        /// create a connection to the DB    
        var connection = mongoose.createConnection(getFullUri(user, password, ""), connect_options);
        connection.on('open', async function() {
            // connection established
            new Admin(connection.db).listDatabases(function(err, result) {
                if (err) { reject(err);}
                // database list stored in result.databases
                console.log('listDatabases succeeded');
                resolve(result.databases);
            });
        });
    })
    
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

module.exports = {getAllDbs, getConnection, SR_EXT, AR_EXT, WR_EXT, SR_BUCKET, AR_BUCKET, WR_BUCKET};
