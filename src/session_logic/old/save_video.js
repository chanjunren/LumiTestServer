const {connectToDb} = require('../../../../globals/db_globals.js')
const path = require('path');

const mongoose = require('mongoose'); 
const mongoDriver = mongoose.mongo;

const GridFS = require('gridfs-stream');
const connection = mongoose.connection;
const fs = require('fs'); // For creating read and write streams

// Where to find the file
var audioPath = path.join(__dirname, '../../../output/AudioRecording_user.wav')

connectToDb();

connection.once('connected', function() {
    
    console.log("Getting ready to upload audio...");
    //console.log("Connection db: ", connection.db);
    var gfs = GridFS(connection.db, mongoDriver);

    var writeStream = gfs.createWriteStream({
        filename:'myFirstAudio.wav'
    });

    fs.createReadStream(audioPath).pipe(writeStream);
    writeStream.on('close', function (error, result) {
        if (error) {
            console.error(error);
        }
        console.log("Result:", result); 
    })
})
