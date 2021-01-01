const {connectToDb, testQnBucket} = require('../../../globals/db_globals.js');
const mongoose = require('mongoose');
const connection = mongoose.connection;
const path = require('path');
const fs = require('fs');

const testAlias = "hiitsjr"
connectToDb(testAlias);

connection.once('connected', function() {
    var qnFilePath = getQnsFromDb();
    console.log(qnFilePath);

})

// Returns path of file 
function getQnsFromDb() {
    var bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: testQnBucket
    });
    var outputPath = path.join(__dirname, "/dbOutput/" + testAlias + "_test_file.csv")

    bucket.openDownloadStreamByName(testAlias + "_test_file.csv").
    pipe(fs.createWriteStream(outputPath)).
    on('error', function(error) {
        console.error(error);
    }).
    on('finish', function() {
        console.log('done!');
    });
    return outputPath;
}
