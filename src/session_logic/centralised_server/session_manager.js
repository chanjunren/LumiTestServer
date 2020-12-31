const {connectToDb} = require('../../../globals/db_globals.js');
const mongoose = require('mongoose');
const connection = mongoose.connection;

connectToDb("hiitsjr");

connection.once('connected', function() {

})



function postStuStatistics(stuStatistics) {
    
}

function getStuStatistics (testAlias, stuId) {

}

function getCurrStatistics (testAlias, sessionId) {

}

// for crash, storing time elapsed etc.
function storeStuLastSave() {
    
}

/*
function uploadTestFilesToDb(directoryPath) {
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
}*/