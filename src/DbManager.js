const connectToDb = require('../src/globals/db_globals')

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
