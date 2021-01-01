const {connectToDb, SR_EXT, AR_EXT, WR_EXT, WR_BUCKET, SR_BUCKET, AR_BUCKET, disconnectFromDb} = require('../globals/db_globals.js')
const path = require('path');
const fs = require('fs'); // For creating read and write streams
const mongodb = require('mongodb');

try {
    run_test();
} catch (e) {
    console.error(e);
}

async function run_test() {
    let connection = await connectToDb("TheFirstTest");
    await sendFilesInDir("/home/tootie/Desktop/Projects/LumiTestServer/src/utils/TheFirstTest_Submissions", connection)
    //disconnectFromDb();
}

function sendFilesInDir(dirPath, connection) {
    fs.readdir(dirPath, function(err, directory) {
        if (err) {
            return console.error(err);
        }
        directory.forEach(function (stuDir) {
            let stuDirPath = path.join(dirPath, stuDir);
            fs.readdir(stuDirPath, function(err, files) {
                if (err) {
                    return console.error(err);
                }
                for (file of files) {
                    let filePath = path.join(stuDirPath, file);
                    let ext = file.split("_")[1];
                    switch (ext) {
                        case SR_EXT:
                            uploadScreenRecording(filePath, file, connection);
                            break;
                        case AR_EXT:
                            uploadAudioRecording(filePath, file, connection);
                            break;
                        case WR_EXT:
                            uploadWebcamRecording(filePath, file, connection);
                            break;
                        default: 
                            console.log("ext: ", ext);
                            throw Error("Attempted to upload file with unhandled extension");
                    }
                    
                }
            })
        })
    })
}

function uploadWebcamRecording(filePath, fileName, connection) {
    const bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: WR_BUCKET
      });
      
      fs.createReadStream(filePath).
        pipe(bucket.openUploadStream(fileName)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
          console.log('done!');
        });
}

function uploadScreenRecording(filePath, fileName, connection) {
    const bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: SR_BUCKET
      });
      
      fs.createReadStream(filePath).
        pipe(bucket.openUploadStream(fileName)).
        on('error', function(error) {
          console.error(error);
        }).
        on('finish', function() {
          console.log('done!');
        });
}

function uploadAudioRecording(filePath, fileName, connection) {
    const bucket = new mongodb.GridFSBucket(connection.db, {
        bucketName: AR_BUCKET
      });
      
      fs.createReadStream(filePath).
        pipe(bucket.openUploadStream(fileName)).
        on('error', function(error) {
            console.error(error);
        }).
        on('finish', function() {
          console.log('done!');
        });
}
