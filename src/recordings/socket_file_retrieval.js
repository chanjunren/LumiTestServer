const fs = require('fs')
const io = require("socket.io")(3000);
const {startFileSendEvent, uploadFileChunkEvent, finishFileUploadEvent, 
      moreFileDataEvent, fileSendErrorEvent} = require('../globals/file_send_globals');

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

async function configureFileReceivingSessionLogic(socket, recordingGlobals) {

    const addedRecordingSocketEventListeners = recordingGlobals.addedRecordingSocketEventListeners;

    function ensureAddedSocketEventListenersExist(socketId) {
        if (addedRecordingSocketEventListeners[socketId] == undefined) {
            addedRecordingSocketEventListeners[socketId] = {
                startSendingFileEvent: false,
                fileChunkUploadEvent: false,
            }
        }
    }

    function sendErr(err) {
        msg = 'Err: ' + err;
        console.log(msg);
        socket.emit(fileSendErrorEvent, msg);
    }    

    if (addedRecordingSocketEventListeners[socket.id] == undefined || !addedRecordingSocketEventListeners[socket.id].startSendingFileEvent) {
        // console.log(`${socket.id}: adding start file send event ${startFileSendEvent}...`)
        console.log(`${socket.id}: adding start file send event ${startFileSendEvent}, ${moreFileDataEvent}...`)
        socket.on(startFileSendEvent, function (data) {
            try {
                console.log('Start received.')
                //data contains the variables that we passed through in the html file
                var Path = data["Path"];
                var Name = data["Name"];
                var Place = 0;
                var saveLocation = path.join(Path, Name);

                fs.mkdirSync(Path, {recursive: true}, err => {
                    console.log(err);
                });
                fs.writeFileSync(saveLocation); // Overwrites existing file

                console.log(`${Name} created.`)
                fs.open(saveLocation, "a", 0755, function (err, fd) {
                    if (err) {
                        console.log(err);
                        sendErr(err)
                    } else {
                        Files[Name] = {
                            //Create a new Entry in The Files Variable
                            FileSize: data["Size"],
                            Offset: getFilesizeInBytes(saveLocation),
                            Data: "",
                            Downloaded: 0,
                            SaveLocation: saveLocation,
                        };
                        console.log(`${socket.id}: Emitting more data...${moreFileDataEvent}`)
                        socket.emit(moreFileDataEvent, { Name: Name, Place: Place, Percent: 0 });
                    }
                });
            } catch (err) {
                sendErr(err);
            }
        });

        ensureAddedSocketEventListenersExist(socket.id);
        addedRecordingSocketEventListeners[socket.id].startSendingFileEvent = true;
    }
    
    if (addedRecordingSocketEventListeners[socket.id] == undefined || !addedRecordingSocketEventListeners[socket.id].fileChunkUploadEvent) {
        console.log(`adding upload file event...${uploadFileChunkEvent}`)
        ss(socket).on(uploadFileChunkEvent, async function (stream, data) {
            try {
                // console.log('Upload received.')
                console.log(`Uploading ${data.name}...`)
                var Name = data.name;
                var saveLocation = Files[Name].SaveLocation;
                stream.pipe(fs.createWriteStream(saveLocation, { flags: 'a' }));
                stream.on('finish', async function() {
                    Files[Name]["Downloaded"] = getFilesizeInBytes(saveLocation) - Files[Name]["Offset"];
                    console.log(Name, 'Downloaded:', numberWithCommas(Files[Name]["Downloaded"])) + ' bytes';
                    console.log(Name, 'Filesize:', numberWithCommas(Files[Name]["FileSize"])) + ' bytes';
                    // console.log(Files[Name]["Downloaded"] >= Files[Name]["FileSize"]);
                    if (Files[Name]["Downloaded"] < Files[Name]["FileSize"]) {
                        // File not fully uploaded.
                        // console.log('File not fully uploaded.');
                        var Place = Files[Name]["Downloaded"] / 524288;
                        var Percent = (Files[Name]["Downloaded"] / Files[Name]["FileSize"]) * 100;
                        // await sleep(1000);
                        socket.emit(moreFileDataEvent, { Name: Name, Place: Place, Percent: Percent });
                    } else {
                        console.log(Name, 'Done');
                        socket.emit(finishFileUploadEvent, Name);
                    }
                });
            } catch (err) {
                sendErr(err);
            }
        });

        ensureAddedSocketEventListenersExist(socket.id);
        addedRecordingSocketEventListeners[socket.id].fileChunkUploadEvent = true;
    }
}

module.exports = {configureFileReceivingSessionLogic};