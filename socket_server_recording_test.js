const fs = require('fs')
const io = require("socket.io")(4000);
var ss = require('socket.io-stream');
var path = require('path');

var Files = {};

io.on('connection', socket => {
    socket.on('joinRoom', userType => {
        console.log(`${userType} joined.`)
        socket.join(userType);
    });

    socket.on('recording_instruction_from_invigilator', function(instruction) {
        socket.broadcast.to('student').emit('recording_instruction_to_student', instruction);
    });
});