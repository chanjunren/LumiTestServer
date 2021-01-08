const fs = require('fs')
const io = require("socket.io")(3000);
const {startFileSendEvent, startFileUploadEvent, finishFileUploadEvent, 
      moreFileDataEvent, fileSendErrorEvent} = require('../globals/chat_globals');

var ss = require('socket.io-stream');
var path = require('path');

var Files = {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const startFileSendEvent = 'startFileSend'
const startFileUploadEvent = 'startFileUpload'

async function configureFileReceivingSessionLogic(socket, addedRecordingSocketEventListeners) {

    function ensureAddedSocketEventListenersExist(socketId) {
        if (addedRecordingSocketEventListeners[socketId] == undefined) {
            addedRecordingSocketEventListeners[socketId] = {
                startSendingFileEvent: false,
                startUploadingFileEvent: false,
            }
        }
    }

    function sendErr(err) {
        msg = 'Err: ' + err;
        console.log(msg);
        socket.emit(fileSendErrorEvent, msg);
    }    


    if (addedRecordingSocketEventListeners[socket.id] == undefined || !addedRecordingSocketEventListeners[socket.id].startSendingFileEvent) {
        socket.on(startFileSendEvent, function (data) {
            try {
                console.log('Start received.')
                //data contains the variables that we passed through in the html file
                var Name = data["Name"];
                var Place = 0;
                fs.writeFileSync(Name); // Overwrites existing file
                console.log(`${Name} created.`)
                fs.open(Name, "a", 0755, function (err, fd) {
                    if (err) {
                        console.log(err);
                        sendErr(err)
                    } else {
                        Files[Name] = {
                            //Create a new Entry in The Files Variable
                            FileSize: data["Size"],
                            Offset: getFilesizeInBytes(Name),
                            Data: "",
                            Downloaded: 0,
                        };
                        socket.emit(moreFileDataEvent, { Place: Place, Percent: 0 });
                    }
                });
            } catch (err) {
                sendErr(err);
            }
        });

        ensureAddedSocketEventListenersExist(socket.id);
        addedRecordingSocketEventListeners[socket.id].startSendingFileEvent = true;
    }
    
    if (addedRecordingSocketEventListeners[socket.id] == undefined || !addedRecordingSocketEventListeners[socket.id].startUploadingFileEvent) {
        ss(socket).on(startFileUploadEvent, async function (stream, data) {
            try {
                // console.log('Upload received.')
                console.log(`Uploading ${data.name}...`)
                var Name = data.name;
                stream.pipe(fs.createWriteStream(path.basename(Name), { flags: 'a' }));
                stream.on('finish', async function() {
                    Files[Name]["Downloaded"] = getFilesizeInBytes(Name) - Files[Name]["Offset"];
                    console.log('Downloaded:', numberWithCommas(Files[Name]["Downloaded"])) + ' bytes';
                    console.log('Filesize:', numberWithCommas(Files[Name]["FileSize"])) + ' bytes';
                    // console.log(Files[Name]["Downloaded"] >= Files[Name]["FileSize"]);
                    if (Files[Name]["Downloaded"] < Files[Name]["FileSize"]) {
                        // File not fully uploaded.
                        // console.log('File not fully uploaded.');
                        var Place = Files[Name]["Downloaded"] / 524288;
                        var Percent = (Files[Name]["Downloaded"] / Files[Name]["FileSize"]) * 100;
                        // await sleep(1000);
                        socket.emit(moreFileDataEvent, { Place: Place, Percent: Percent });
                    } else {
                        console.log('Done');
                        socket.emit(finishFileUploadEvent, Name);
                    }
                });
            } catch (err) {
                sendErr(err);
            }
        });

        ensureAddedSocketEventListenersExist(socket.id);
        addedRecordingSocketEventListeners[socket.id].startUploadingFileEvent = true;
    }
}

module.exports = {configureFileReceivingSessionLogic};