const {connectToDb} = require('../../../globals/db_globals.js')
const path = require('path');
const mongoose = require('mongoose'); 
const mongoDriver = mongoose.mongo;
const GridFS = require('gridfs-stream');
const connection = mongoose.connection;
const fs = require('fs'); // For creating read and write streams
const dbName = sessionStorage.getItem("test_alias");

function sendAllFiles(gfs) {
    connectToDb(dbName);

    connection.once('connected', function() {
        console.log("Getting ready to upload files...");
        //console.log("Connection db: ", connection.db);    
        sendCamRecording(gfs);
        sendAudioFile(gfs);
        sendScreenRecording(gfs);
        sendAnswerFile(gfs);
        var gfs = GridFS(connection.db, mongoDriver);
    })

}

function sendCamRecording(gfs) {
    var camRecordingPath = path.join(__dirname, '../../../output/AudioRecording_user.wav')
    var writeStream = gfs.createWriteStream({
        // Any of the GridFS file chunks collection
        // Left empty because file should 
    });

    fs.createReadStream(camRecordingPath).pipe(writeStream);
    writeStream.on('close', function (error, result) {
        if (error) {
            console.error(error);
        }
        console.log("Result:", result); 
    })
}

function sendAudioFile(gfs) {
    //var audioPath = path.join(__dirname, '../../../output/AudioRecording_user.wav')
    var camRecordingPath = path.join(__dirname, '../../../output/AudioRecording_user.wav')
    var writeStream = gfs.createWriteStream({
        // Any of the GridFS file chunks collection
        // Left empty because file should 
    });

    fs.createReadStream(camRecordingPath).pipe(writeStream);
    writeStream.on('close', function (error, result) {
        if (error) {
            console.error(error);
        }
        console.log("Result:", result); 
    })
}

function sendAnswerFile(gfs) {
    var camRecordingPath = path.join(__dirname, '../../../output/AudioRecording_user.wav')
    var writeStream = gfs.createWriteStream({
        // Any of the GridFS file chunks collection
        // Left empty because file should 
    });

    fs.createReadStream(camRecordingPath).pipe(writeStream);
    writeStream.on('close', function (error, result) {
        if (error) {
            console.error(error);
        }
        console.log("Result:", result); 
    })
}

function getTestFile(session_id) {

}

