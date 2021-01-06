// const app = require('express')();
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

const {chatMsgEvent, mediaMsgEvent, joinEvent, infoEvent, populateUsersEvent, 
       chatErrorEvent, formatMessage, getWelcomeMessage, getJoinMessage, getLeftMessage, 
       getInvalidUserMessage, allInvilsId, allStudentsId} = require('../globals/chat_globals');
const {userJoin, getCurrentUser, getUserName, getInvilSessions, getUserType, 
       isValidUser, isValidUserIdAndSessions} = require('../chat/chat_utils');
const { INVIL_TYPE, STU_TYPE } = require("../models/db_schemas.js");
       // const { connected } = require('process');
// const { RSA_PKCS1_PADDING } = require('constants');

// http.listen(5000, () => {
//     console.log("Listening on 5000");
// })

// var path = require('path');

// const fs = require('fs')
var ss = require('socket.io-stream');

// io.setMaxListeners(0);
// io.sockets.setMaxListeners(0);

//Client connects
// io.on('connection', (socket) => {
    // User joins

async function configureChatSessionLogic(socket, chatGlobals) {
    var chatSocketIds = chatGlobals.chatSocketIds;
    var chatSocketIdsToUserMap = chatGlobals.chatSocketIdsToUserMap;
    var chatUserIdToSocketsMap = chatGlobals.chatUserIdToSocketsMap;
    var chatRoomsToSocketIdsMap = chatGlobals.chatRoomsToSocketIdsMap;
    var chatSocketIdsToRoomsMap = chatGlobals.chatSocketIdsToRoomsMap;

    // console.log(`Configuring session logic for ${socket.id}...`);
    socket.setMaxListeners(0);
    if (chatSocketIds.has(socket.id)) {
        console.log(`socket ${socket.id} already connected.`);
        var user = chatSocketIdsToUserMap[socket.id];
        for (i in user.sessions) {
            var session = user.sessions[i]
            setStudentConnectionStatus(session, user.userId, true);
        }
    }
    socket.on(joinEvent, ({userId, sessions}) => {
        console.log('socket ' + socket.id + ' connected.');
        for (i in sessions) {
            var session = sessions[i];
            setStudentConnectionStatus(session, userId, true);
        }
        chatSocketIds.add(this.id);
        try {
            function broadcastInfoToType(session, userType, infoType, info) {
                if (infoType == 'userLeft') {
                    console.log(infoEvent, session, userType, infoType, info)
                };
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
                    if (chatRoomsToSocketIdsMap[room_name] != undefined) {
                        for (clientSocketId in chatRoomsToSocketIdsMap[room_name]) {
                            if (clientSocketId != socket.id) {
                                var userId = chatSocketIdsToUserMap[clientSocketId].userId;
                                var clientSocket = chatUserIdToSocketsMap[userId];
                                var sendStream = ss.createStream();                    
                                ss(clientSocket).emit(mediaMsgEvent, sendStream, senderUserName, msg, sendAsAnnouncement);
                                stream.pipe(sendStream);
                            }
                        }
                    }
                }
            }

            function populateToType(socket, session, userType) {
                var room_name = session + '_' + userType;
                // var room = io.sockets.adapter.rooms[room_name];
                // console.log('chatRoomsToSocketIdsMap', chatRoomsToSocketIdsMap[room_name], chatRoomsToSocketIdsMap, room_name);
                if (chatRoomsToSocketIdsMap[room_name] != undefined) {
                    var connectedUsers = [];
                    for (clientSocketId in chatRoomsToSocketIdsMap[room_name]) {
                        // console.log('chatSocketIdsToUserMap', chatSocketIdsToUserMap[clientSocketId]);
                        var user = chatSocketIdsToUserMap[clientSocketId];
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
                var destinationSocket = chatUserIdToSocketsMap[dest_id];
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

            function sendMessageFromStudent(senderUserName, dest_id, session, msg, stream='') {
                var dest_session = session;
                if (dest_session != null) {
                    if (dest_id == allInvilsId) {
                        broadcastMsgToType(senderUserName, dest_session, INVIL_TYPE, msg, false, stream);
                    } else if (getUserType(dest_session, dest_id) == INVIL_TYPE) {
                        sendToId(senderUserName, dest_id, msg, stream);
                    }
                }
            }

            function sendMessageFromInvigilator(senderUserName, dest_id, session, msg, sendAsAnnouncement, stream='') {
                if (sendAsAnnouncement) { dest_id = 'all'; }
                if (dest_id == allInvilsId || dest_id == 'all') {
                    broadcastMsgToType(senderUserName, session, INVIL_TYPE, msg, sendAsAnnouncement, stream);
                } 
                if (dest_id == allStudentsId || dest_id == 'all') {
                    broadcastMsgToType(senderUserName, session, STU_TYPE, msg, sendAsAnnouncement, stream);
                }
                if (dest_id != allInvilsId && dest_id != allStudentsId && dest_id != 'all') {
                    sendToId(senderUserName, dest_id, msg, stream);
                }
            }

            // var userType = getUserType(userId);
            // if (userType != INVIL_TYPE && Object.keys(sessions).length > 1) {
            //     socket.emit(chatErrorEvent, getInvalidUserMessage(userId, sessions));                
            // }
            // if (userType == INVIL_TYPE && (sessions == null || Object.keys(sessions).length == 0)) {
            //     sessions = getInvilSessions(userId);
            // }
            if (!isValidUserIdAndSessions(socket, userId, sessions)) { return; }

            const user = userJoin(socket.id, userId, sessions);
            chatSocketIdsToUserMap[socket.id] = user;
            for (i in sessions) {
                var session = sessions[i];
                var userType = getUserType(session, userId);
                var room_name = session + '_' + userType;
                socket.emit(infoEvent, session, 'welcome', formatMessage(user, getWelcomeMessage(session)));
                socket.join(room_name);
                if (chatRoomsToSocketIdsMap[room_name] == undefined) {
                    chatRoomsToSocketIdsMap[room_name] = {};
                }
                if (chatSocketIdsToRoomsMap[socket.id] == undefined) {
                    chatSocketIdsToRoomsMap[socket.id] = {};
                }
                chatRoomsToSocketIdsMap[room_name][socket.id] = 1;
                chatSocketIdsToRoomsMap[socket.id][room_name] = 1;

                // console.log('Updated chatRoomsToSocketIdsMap', chatRoomsToSocketIdsMap[room_name], chatRoomsToSocketIdsMap)
                // console.log('Updated chatSocketIdsToRoomsMap', chatSocketIdsToRoomsMap[socket.id], chatSocketIdsToRoomsMap)

                // console.log(Object.keys(roomsToSocketIdsMap[room_name]).length, room_name);
                // console.log(Object.keys(socketIdsToRoomsMap[socket]).length, room_name);
                // console.log(roomsToSocketIdsMap[room_name][socket], room_name);
                // console.log(socketIdsToRoomsMap[socket][room_name], room_name);

                // console.log('populating invilUser')
                populateToType(socket, session, INVIL_TYPE);
                if (userType == INVIL_TYPE) {
                    // console.log('populating studentUser')
                    populateToType(socket, session, STU_TYPE);
                }
                var infoType = 'userJoined'
                var info = formatMessage(user, getJoinMessage(user.username));
                broadcastInfoToType(session, INVIL_TYPE, infoType, info);
                if (userType == INVIL_TYPE) {
                    broadcastInfoToType(session, STU_TYPE, infoType, info);
                }
                chatUserIdToSocketsMap[userId] = socket;
            }

            function handleReceivedMessage(msg, sendAsAnnouncement, stream='') {
                const sender_userId = msg.userId;
                const dest_sessions = msg.sessions;
                const dest_id = msg.destId;
                if (!isValidUserIdAndSessions(socket, sender_userId, dest_sessions, sendAsAnnouncement)) { 
                    return; 
                }
                for (i in dest_sessions) {
                    var session = dest_sessions[i];
                    const userType = getUserType(session, sender_userId);

                    // console.log(sender_userId);
                    // console.log(dest_sessions);
                    // console.log(dest_id);
                    // console.log(userType);
                    // console.log(sendAsAnnouncement);

                    if (userType == INVIL_TYPE && dest_sessions == 'all') {
                        dest_sessions = user.sessions;
                    } else if (sendAsAnnouncement && userType == STU_TYPE) {
                        continue;
                    }

                    const senderUserName = getUserName(sender_userId);
                    if (userType == INVIL_TYPE) {
                        sendMessageFromInvigilator(senderUserName, dest_id, session, msg, sendAsAnnouncement, stream);
                    } else {
                        sendMessageFromStudent(senderUserName, dest_id, session, msg, stream);
                    }
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
                console.log('socket ' + socket.id + ' disconnected.');
                chatSocketIds.delete(this.id);
                var leftUser = chatSocketIdsToUserMap[socket.id];
                console.log('left', leftUser);
                if (leftUser == undefined) { return; }
                // io.to(user.session).emit(infoEvent, session, 'userLeft', formatMessage(leftUser, getLeftMessage(leftUser.username)));

                var infoType = 'userLeft'
                var info = formatMessage(leftUser, getLeftMessage(leftUser.username));
                for (i in leftUser.sessions) {
                    var session = leftUser.sessions[i]
                    broadcastInfoToType(session, INVIL_TYPE, infoType, info);
                    if (userType == INVIL_TYPE) {
                        broadcastInfoToType(session, STU_TYPE, infoType, info);
                    }
                    setStudentConnectionStatus(session, leftUser.userId, false);
                }

                delete chatSocketIdsToUserMap[socket.id];
                delete chatUserIdToSocketsMap[leftUser.userId];
                var rooms = chatSocketIdsToRoomsMap[socket.id];
                if (rooms != undefined) {
                    for (room in rooms) {
                        if (chatRoomsToSocketIdsMap[room] != undefined) {
                            delete chatRoomsToSocketIdsMap[room][socket.id];
                        }
                    }
                }
                delete chatSocketIdsToRoomsMap[socket.id];
            })
        } catch (err) {
            console.log(err);
            socket.emit(chatErrorEvent, 'An error occured: ' + err);
        }
    })
};

module.exports = {configureChatSessionLogic};