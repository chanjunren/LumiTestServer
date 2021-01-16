const fs = require('fs')
const io = require("socket.io")(3000);
var ss = require('socket.io-stream');
var path = require('path');
const ReadableStreamClone = require("readable-stream-clone");
var CombinedStream = require('combined-stream');

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

// io.on('connection', function(socket) {
//     ss(socket).on('Upload', function(stream, data) {
//       var filename = path.basename(data.name);
//       stream.pipe(fs.createWriteStream(filename));
//     });
// });

io.on("connection", (socket) => {
    function sendErr(err) {
        throw err;
        msg = 'Err: ' + err;
        console.log(msg);
        socket.emit('Error', msg);
    }    

    socket.on("Start", function (data) {
        try {
            console.log('Start received.')
            //data contains the variables that we passed through in the html file
            var Path = data["Path"];
            var Name = data["Name"];
            var Place = 0;
            var saveLocation = path.join(Path, Name);
            console.log(Path)
            fs.mkdirSync(Path, {recursive: true}, err => {
                console.log(err);
            });
            fs.writeFileSync(saveLocation); // Overwrites existing file
            console.log('helloworld');
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
                        AudioStreams: []
                    };
                    socket.emit("MoreData", { Place: Place, Percent: 0 });
                }
            });
        } catch (err) {
            sendErr(err);
        }
    });
// });

//   ss(socket).on('Upload2', function(stream, data) {
//     console.log('Upload2 received.');
//     var filename = path.basename(data.name);
//     stream.pipe(fs.createWriteStream(filename));
//   });

//   ss(socket).on('Upload', function(stream, data) {
//     var filename = path.basename(data.name);
//     stream.pipe(fs.createWriteStream(filename), {end: false});
//   });

  ss(socket).on("Upload", async function (stream, data) {
    try {
        // console.log('Upload received.')
        console.log(`Uploading ${data.name}...`)
        var Name = data.name;
        var saveLocation = Files[Name].SaveLocation;
        streamclone = new ReadableStreamClone(stream);
        Files[Name].AudioStreams.push(streamclone);
        stream.pipe(fs.createWriteStream(saveLocation, {flags: 'a'}));
        stream.on('finish', async function() {
            Files[Name]["Downloaded"] = getFilesizeInBytes(saveLocation) - Files[Name]["Offset"];
            console.log('Downloaded:', numberWithCommas(Files[Name]["Downloaded"])) + ' bytes';
            console.log('Filesize:', numberWithCommas(Files[Name]["FileSize"])) + ' bytes';
            // console.log(Files[Name]["Downloaded"] >= Files[Name]["FileSize"]);
            if (Files[Name]["Downloaded"] < Files[Name]["FileSize"]) {
                // File not fully uploaded.
                // console.log('File not fully uploaded.');
                var Place = Files[Name]["Downloaded"] / 524288;
                var Percent = (Files[Name]["Downloaded"] / Files[Name]["FileSize"]) * 100;
                // await sleep(1000);
                socket.emit("MoreData", { Place: Place, Percent: Percent });
            } else {
                // console.log('Done');
                // socket.emit("Done", Name);
                var combinedStream = CombinedStream.create();

                for (i = 0; i < Files[Name].AudioStreams.length; i++) {
                    stream = Files[Name].AudioStreams[i];
                    combinedStream.append(stream);
                    // combinedStream.append(function(next) {
                    //     // console.log('next' + i);
                    //     next(stream);
                    // });
                }
    
                combinedStream.pipe(fs.createWriteStream(saveLocation));
                // console.log('test');
                combinedStream.on('end', async function() {
                    console.log('Done');
                    socket.emit("Done", Name);
                });
            }
        });
    } catch (err) {
        sendErr(err);
    }
  });
  console.log();
});

// io.on('connection', socket => {
//   // either with send()
//   socket.send('Hello!');

//   // or with emit() and custom event names
//   socket.emit('greetings', 'Hey!', { 'ms': 'jane' }, Buffer.from([4, 3, 3, 1]));

//   // handle the event sent with socket.send()
//   socket.on('message', (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on('salutations', (elem1, elem2, elem3) => {
//     console.log(elem1, elem2, elem3);
//   });
// });
