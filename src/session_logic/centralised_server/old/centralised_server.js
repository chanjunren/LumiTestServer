const {connectToDb, directoryPath, testAlias, webcamRecordingExtension, screenRecordingExtension, audioRecordingExtension} = require('../../../globals/db_globals.js')
const mongoose = require('mongoose'); 
const mongoDriver = mongoose.mongo;
const GridFS = require('gridfs-stream');
const connection = mongoose.connection;
const fs = require('fs'); // For creating read and write streams
const path = require('path');

//sendAllFiles(directoryPath);
//postTestFileToDb('C:/Projects/ay2021-cs3103-group-9/Examiner/encrypted.csv', 'ay2021cs3103midterm');
//getTestFileFromDb(testAlias)
getAllFilesOf('E0123123');

function sendAllFiles(directoryPath) {
    connectToDb(testAlias);

    connection.once('connected', function() {
        console.log("Getting ready to upload files...");
        // Can create buckets for optimization / organization
        // But for now I choose not to as there is already 1 database for each 
        // examination so search time should still be constant 
        var bucket = new mongoose.mongo.GridFSBucket(connection.db);
        
        fs.readdir(directoryPath, function(err, serverDirectory) {
            if (err) {
                return console.error(err);
            }
            serverDirectory.forEach(function (studentDirectory) {
                var studentDirectoryPath = directoryPath + "/" + studentDirectory;
                sendAllFilesInDirectory(studentDirectoryPath, bucket);
            })
        })
    })

    
}

function sendAllFilesInDirectory(studentDirectoryPath, bucket) {
    fs.readdir(studentDirectoryPath, function(err, directory) {
        if (err) {
            return console.error(err);
        }
        directory.forEach(function (fileName) {
            var filePath = studentDirectoryPath + "/" + fileName;

            fs.createReadStream(filePath).
            pipe(bucket.openUploadStream(testAlias + "_" + fileName)).
            on('error', function(error) {
                assert.ifError(error);
            }).
            on('finish', function() {
                console.log('done!');
            });
        })
    })
}

function postTestFileToDb(testFilePath) {
    connectToDb(testAlias);

    connection.once('connected', function() {
        console.log("Getting ready to upload files...");
        var bucket = new mongoose.mongo.GridFSBucket(connection.db);

        fs.createReadStream(testFilePath).
        pipe(bucket.openUploadStream(testAlias + "_test_file.csv")).
        on('error', function(error) {
            assert.ifError(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
    });
}

function getTestFileFromDb(testAlias) {
    connectToDb(testAlias);

    connection.once('connected', function() {
        console.log("Getting ready to download test file...");

        var bucket = new mongoose.mongo.GridFSBucket(connection.db);
        var outputPath = path.join(__dirname, "/dbOutput/" + testAlias + "_test_file.csv")

        bucket.openDownloadStreamByName(testAlias + "_test_file.csv").
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
    });
}

// does not work if directory does not exist
function getAllFilesOf(studentId) {
    connectToDb(testAlias);
    
    connection.once('connected', function() {
        console.log("Getting ready to get all files...");
        var bucket = new mongoose.mongo.GridFSBucket(connection.db);
        getAnswerFile(bucket, studentId);
        getWebcamRecording(bucket, studentId);
        getScreenRecording(bucket, studentId);
        getAudioRecording(bucket, studentId);
    });
}

function getAnswerFile(bucket, studentId) {
    var fileName = testAlias + "_" + studentId + "_answers.txt";
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);

    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}

function getWebcamRecording(bucket, studentId) {
    var fileName = testAlias + "_" + studentId + webcamRecordingExtension;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);

    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}

function getScreenRecording(bucket, studentId) {
    var fileName = testAlias + "_" + studentId + screenRecordingExtension;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);

    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}

function getAudioRecording(bucket, studentId) {
    var fileName = testAlias + "_" + studentId + audioRecordingExtension;
    var outputPath = path.join(__dirname, "/dbOutput/" + fileName);

    bucket.openDownloadStreamByName(fileName).
        pipe(fs.createWriteStream(outputPath)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
            console.log('done!');
        });
}
