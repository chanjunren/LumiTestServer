const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {chatMsgEvent, mediaMsgEvent, joinEvent, infoEvent, populateUsersEvent, 
       chatErrorEvent, studentUserType, invilUserType,
       formatMessage, getWelcomeMessage, getJoinMessage, getLeftMessage, 
       getInvalidUserMessage, allInvilsId, allStudentsId} = require('../globals/chat_globals');
const {userJoin, getCurrentUser, getUserName, getInvilSessions, getUserType, isValidUser, isValidUserIdAndSessions} = require('../chat/user_utils');
const { connected } = require('process');
const { RSA_PKCS1_PADDING } = require('constants');

http.listen(5000, () => {
    console.log("Listening on 5000");
})

var socketIdsToUserMap = {};
var userIdToSocketsMap = {};
var roomsToSocketIdsMap = {};
var socketIdsToRoomsMap = {};

var path = require('path');

const fs = require('fs')
var ss = require('socket.io-stream');

//Client connects
io.on('connection', (socket) => {
    // User joins
    socket.on(joinEvent, ({userId, sessions}) => {
        console.log('socket ' + socket.id + ' connected.');
        try {
            function broadcastInfoToType(session, userType, infoType, info) {
                socket.broadcast
                .to(session + '_' + userType)
                .emit(infoEvent, session, infoType, info);
            }

            function broadcastMsgToType(senderUserName, session, userType, msg, sendAsAnnouncement, stream='') {
                // console.log('stream:', stream);
                if (stream == '') {
                    socket.broadcast
                    .to(session + '_' + userType)
                    .emit(chatMsgEvent, senderUserName, msg, sendAsAnnouncement);
                } else {
                    var room_name = session + '_' + userType;
                    if (roomsToSocketIdsMap[room_name] != undefined) {
                        for (clientSocketId in roomsToSocketIdsMap[room_name]) {
                            var userId = socketIdsToUserMap[clientSocketId].userId;
                            var clientSocket = userIdToSocketsMap[userId];
                            var sendStream = ss.createStream();                    
                            ss(clientSocket).emit(mediaMsgEvent, sendStream, senderUserName, msg, sendAsAnnouncement);
                            stream.pipe(sendStream);
                        }
                    }
                }
            }

            function populateToType(socket, session, userType) {
                var room_name = session + '_' + userType;
                // var room = io.sockets.adapter.rooms[room_name];
                // console.log('room', roomsToSocketIdsMap[room_name], room_name);
                if (roomsToSocketIdsMap[room_name] != undefined) {
                    var connectedUsers = [];
                    for (clientSocketId in roomsToSocketIdsMap[room_name]) {
                        var user = socketIdsToUserMap[clientSocketId];
                        connectedUsers.push(user);
                    }
                    // console.log('connected: ', connectedUsers);
                    socket.emit(populateUsersEvent, connectedUsers);   
                }
                // if (room != undefined) {
                //     var clients = room.sockets;   
                //     var connectedUsers = []
                //     for (var clientId in clients) {
                //         var clientSocket = io.sockets.connected[clientId];
                //         if (clientSocket.id != socket.id) {
                //             connectedUsers.push(socketIdsToUserMap[clientSocket]);
                //         }
                //     }
                //     socket.emit(populateUsersEvent, connectedUsers);   
                // }

            }

            function sendToId(senderUserName, dest_id, msg, stream='') {
                var destinationSocket = userIdToSocketsMap[dest_id];
                if (destinationSocket != undefined) {
                    // console.log('stream:', stream);                  
                    if (stream == '') {
                        destinationSocket.emit(chatMsgEvent, senderUserName, msg);
                    } else {
                        var sendStream = ss.createStream();  
                        ss(destinationSocket).emit(mediaMsgEvent, sendStream, senderUserName, msg);
                        stream.pipe(sendStream);
                    }
                }                
            }

            function sendMessageFromStudent(senderUserName, dest_id, dest_sessions, msg, stream='') {
                var dest_session = dest_sessions[0];
                if (dest_session != null) {
                    if (dest_id == allInvilsId) {
                        broadcastMsgToType(senderUserName, dest_session, invilUserType, msg, false, stream);
                    } else if (getUserType(dest_id) == invilUserType) {
                        sendToId(senderUserName, dest_id, msg, stream);
                    }
                }
            }

            function sendMessageFromInvigilator(senderUserName, dest_id, dest_sessions, msg, sendAsAnnouncement, stream='') {
                if (sendAsAnnouncement) { dest_id = 'all'; }
                if (dest_id == allInvilsId || dest_id == 'all') {
                    for (i in dest_sessions) {
                        var session = dest_sessions[i];
                        broadcastMsgToType(senderUserName, session, invilUserType, msg, sendAsAnnouncement, stream);
                    }
                } 
                if (dest_id == allStudentsId || dest_id == 'all') {
                    for (i in dest_sessions) {
                        var session = dest_sessions[i]
                        broadcastMsgToType(senderUserName, session, studentUserType, msg, sendAsAnnouncement, stream);
                    }
                }
                if (dest_id != allInvilsId && dest_id != allStudentsId && dest_id != 'all') {
                    sendToId(senderUserName, dest_id, msg, stream);
                }
            }

            var userType = getUserType(userId);
            if (userType != invilUserType && Object.keys(sessions).length > 1) {
                socket.emit(chatErrorEvent, getInvalidUserMessage(userId, sessions));                
            }
            if (userType == invilUserType && (sessions == null || Object.keys(sessions).length == 0)) {
                sessions = getInvilSessions(userId);
            }
            if (!isValidUserIdAndSessions(socket, userId, sessions)) { return; }

            const user = userJoin(socket.id, userId, sessions);
            socketIdsToUserMap[socket.id] = user;
            for (i in sessions) {
                session = sessions[i];
                var room_name = session + '_' + userType;
                socket.emit(infoEvent, session, 'welcome', formatMessage(user, getWelcomeMessage(session)));
                socket.join(room_name);
                if (roomsToSocketIdsMap[room_name] == undefined) {
                    roomsToSocketIdsMap[room_name] = {};
                }
                if (socketIdsToRoomsMap[socket.id] == undefined) {
                    socketIdsToRoomsMap[socket.id] = {};
                }
                roomsToSocketIdsMap[room_name][socket.id] = 1;
                socketIdsToRoomsMap[socket.id][room_name] = 1;

                // console.log(Object.keys(roomsToSocketIdsMap[room_name]).length, room_name);
                // console.log(Object.keys(socketIdsToRoomsMap[socket]).length, room_name);
                // console.log(roomsToSocketIdsMap[room_name][socket], room_name);
                // console.log(socketIdsToRoomsMap[socket][room_name], room_name);

                // console.log('populating invilUser')
                populateToType(socket, session, invilUserType);
                if (userType == invilUserType) {
                    // console.log('populating studentUser')
                    populateToType(socket, session, studentUserType);
                }
                var infoType = 'userJoined'
                var info = formatMessage(user, getJoinMessage(user.username));
                broadcastInfoToType(session, invilUserType, infoType, info);
                if (userType == invilUserType) {
                    broadcastInfoToType(session, studentUserType, infoType, info);
                }
                userIdToSocketsMap[userId] = socket;
            }

            function handleReceivedMessage(msg, sendAsAnnouncement, stream='') {
                const sender_userId = msg.userId;
                const dest_sessions = msg.sessions;
                const dest_id = msg.destId;
                const userType = getUserType(sender_userId);

                console.log(sender_userId);
                console.log(dest_sessions);
                console.log(dest_id);
                console.log(userType);
                // console.log(sendAsAnnouncement);

                if (userType == invilUserType && dest_sessions == 'all') {
                    dest_sessions = user.sessions;
                } else if (!isValidUserIdAndSessions(socket, sender_userId, dest_sessions, sendAsAnnouncement)) { 
                    return; 
                } else if (sendAsAnnouncement && userType == studentUserType) {
                    return;
                }

                const senderUserName = getUserName(sender_userId);
                if (userType == invilUserType) {
                    sendMessageFromInvigilator(senderUserName, dest_id, dest_sessions, msg, sendAsAnnouncement, stream);
                } else {
                    sendMessageFromStudent(senderUserName, dest_id, dest_sessions, msg, stream);
                }
                    // io.to(user.session).emit(chatMsgEvent, msg);   
            }

            // ss(socket).on(mediaMsgEvent, function(stream, msg) {
            //     stream.pipe(fs.createWriteStream('example_name.avi'));
            // });

            ss(socket).on(mediaMsgEvent, function(stream, msg, sendAsAnnouncement) {
                // console.log('media message received', new Date(), stream);
                handleReceivedMessage(msg, sendAsAnnouncement, stream);
            });
            
            // User sends a message
            socket.on(chatMsgEvent, (msg, sendAsAnnouncement) => {
                handleReceivedMessage(msg, sendAsAnnouncement);
            })

            socket.on('disconnect', () => {
                var leftUser = socketIdsToUserMap[socket.id];
                console.log('left', leftUser);
                // io.to(user.session).emit(infoEvent, session, 'userLeft', formatMessage(leftUser, getLeftMessage(leftUser.username)));

                var infoType = 'userLeft'
                var info = formatMessage(leftUser, getLeftMessage(leftUser.username));
                broadcastInfoToType(session, invilUserType, infoType, info);
                if (userType == invilUserType) {
                    broadcastInfoToType(session, studentUserType, infoType, info);
                }
                delete socketIdsToUserMap[socket.id];
                delete userIdToSocketsMap[leftUser.userId];
                var rooms = socketIdsToRoomsMap[socket.id];
                if (rooms != undefined) {
                    for (room in rooms) {
                        if (roomsToSocketIdsMap[room] != undefined) {
                            delete roomsToSocketIdsMap[room][socket.id];
                        }
                    }
                }
                delete socketIdsToRoomsMap[socket.id];
            })
        } catch (err) {
            console.log(err);
            socket.emit(chatErrorEvent, 'An error occured: ' + err);
        }
    })
    
})