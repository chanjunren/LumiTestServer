const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {chatMsgEvent, joinEvent, formatMessage, getWelcomeMessage, getJoinMessage} = require('../globals/chat_globals');
const {userJoin, getCurrentUser} = require('./chat_utils');

const TEST_ALIAS = "cs3103-test-lol"

http.listen(5000, () => {
    console.log("Listening on 5000");
})

//Client connects
io.on('connection', (socket) => {
    // User joins
    socket.on(joinEvent, ({username, session}) => {
        const user = userJoin(socket.id, username, session);
        console.log("User:", user);
        socket.join(user.session);

        socket.emit(chatMsgEvent, formatMessage(user.username, getWelcomeMessage(TEST_ALIAS)));

        socket.broadcast
            .to(user.session)
            .emit(chatMsgEvent, formatMessage(user.username, getJoinMessage(user.username)));
            // User sends a message
        socket.on(chatMsgEvent, (msg) => {
            io.to(user.session).emit(chatMsgEvent, msg);
        })

        socket.on('disconnect', () => {
            io.to(user.session).emit(chatMsgEvent, 'a user has left...');
        })
    })
})