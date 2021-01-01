const {connectToDb, SR_EXT, AR_EXT, WR_EXT, WR_BUCKET, SR_BUCKET, AR_BUCKET, disconnectFromDb} = require('../globals/db_globals')
const path = require('path');
const mongodb = require('mongodb');
const fs = require('fs');

try {
    run_test();
} catch (e) {
    console.error(e);
}

async function run_test() {
    let connection = await connectToDb("TheFirstTest");
    getAllFilesOf("e0123123", connection);
    //disconnectFromDb();
}

// does not work if directory does not exist
function getAllFilesOf(studentId, connection) {    

    console.log("Getting ready to get all files...");
    getWebcamRecording(studentId, connection);
    getScreenRecording(studentId, connection);
    //getAudioRecording(studentId, connection);
}


function getWebcamRecording(studentId, connection) {
    var fileName = studentId + "_" + WR_EXT;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);
    
    let bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: WR_BUCKET
    });
    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}

function getAudioRecording(studentId, connection) {
    var fileName = studentId + "_" + AR_EXT;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);
    
    let bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: AR_BUCKET
    });
    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}

function getScreenRecording(studentId, connection) {
    var fileName = studentId + "_" + SR_EXT;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);
    
    let bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: SR_BUCKET
    });
    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}
