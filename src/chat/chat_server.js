// const app = require('express')();
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

const {chatMsgEvent, mediaMsgEvent, joinEvent, infoEvent, populateUsersEvent, 
       chatErrorEvent, formatMessage, getWelcomeMessage, getJoinMessage, getLeftMessage, 
       getInvalidUserMessage, allInvilsId, allStudentsId} = require('../globals/chat_globals');
const {userJoin, getCurrentUser, getUserName, getInvilSessions, getUserType, 
       isValidUser, isValidUserIdAndSessions} = require('../chat/chat_utils');
const { INVIL_TYPE, STU_TYPE } = require("../models/db_schemas.js");
const { addRecordingSocketListeners, addPopulationSocketListeners } = require('../chat/recording_utils');

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
    var addedChatSocketEventListeners = chatGlobals.addedChatSocketEventListeners;

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
        // if (chatSocketIds.has(socket.id)) {
        //     console.log(`socket ${socket.id} already joined.`);
        //     return;
        // }
        // console.log('socket ' + socket.id + ' connected.');

        chatSocketIds.add(socket.id);
        // console.log('chatSocketId added:', chatSocketIds);
        try {
            function broadcastInfoToType(session, userType, infoType, info) {
                if (infoType == 'userLeft') {
                    // console.log(infoEvent, session, userType, infoType, info)
                };
                socket.broadcast
                .to(session + '_' + userType)
                .emit(infoEvent, session, infoType, info);
            }

            function broadcastMsgToType(senderUserName, session, userType, msg, sendAsAnnouncement, stream='', examStartInstruction = '') {
                // console.log('stream:', stream);
                if (stream == '') {
                    var eventToEmit = examStartInstruction == '' ? chatMsgEvent : examStartInstruction;
                    socket.broadcast
                    .to(session + '_' + userType)
                    .emit(eventToEmit, senderUserName, msg, sendAsAnnouncement);
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

            function sendConnectedUsersIn(socket, ...userTypes) {
                var connectedUsers = [];
                for (const i in userTypes) {
                    userType = userTypes[i];
                    var room_name = session + '_' + userType;
                    // var room = io.sockets.adapter.rooms[room_name];
                    // console.log('chatRoomsToSocketIdsMap', chatRoomsToSocketIdsMap[room_name], chatRoomsToSocketIdsMap, room_name);
                    if (chatRoomsToSocketIdsMap[room_name] != undefined) {
                        for (clientSocketId in chatRoomsToSocketIdsMap[room_name]) {
                            // console.log('chatSocketIdsToUserMap', chatSocketIdsToUserMap[clientSocketId]);
                            var user = chatSocketIdsToUserMap[clientSocketId];
                            connectedUsers.push(user);
                        }
                        // console.log('connected: ', connectedUsers);
                    }
                }
                socket.emit(populateUsersEvent, connectedUsers);
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

            function sendToId(senderUserName, dest_id, msg, stream='', examStartInstruction='') {
                var destinationSocket = chatUserIdToSocketsMap[dest_id];
                if (destinationSocket != undefined) {
                    // console.log('stream:', stream);                  
                    if (stream == '') {
                        var eventToEmit = examStartInstruction == '' ? chatMsgEvent : examStartInstruction;
                        destinationSocket.emit(eventToEmit, senderUserName, msg);
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

            function sendMessageFromInvigilator(senderUserName, dest_id, session, msg, sendAsAnnouncement, stream='', examStartInstruction='') {
                if (sendAsAnnouncement) { dest_id = 'all'; }
                if (dest_id == allInvilsId || dest_id == 'all') {
                    if (examStartInstruction != '') { return; }
                    broadcastMsgToType(senderUserName, session, INVIL_TYPE, msg, sendAsAnnouncement, stream, examStartInstruction);
                } 
                if (dest_id == allStudentsId || dest_id == 'all') {
                    broadcastMsgToType(senderUserName, session, STU_TYPE, msg, sendAsAnnouncement, stream, examStartInstruction);
                }
                if (dest_id != allInvilsId && dest_id != allStudentsId && dest_id != 'all') {
                    sendToId(senderUserName, dest_id, msg, stream, examStartInstruction);
                }
            }

            // var userType = getUserType(userId);
            // if (userType != INVIL_TYPE && Object.keys(sessions).length > 1) {
            //     socket.emit(chatErrorEvent, getInvalidUserMessage(userId, sessions));                
            // }
            // if (userType == INVIL_TYPE && (sessions == null || Object.keys(sessions).length == 0)) {
            //     sessions = getInvilSessions(userId);
            // }
            if (!isValidUserIdAndSessions(socket, userId, sessions)) { 
                return; 
            }

            const user = userJoin(socket.id, userId, sessions);
            chatSocketIdsToUserMap[socket.id] = user;
            
            for (i in sessions) {
                var session = sessions[i];
                var userType = getUserType(session, userId);
                var room_name = session + '_' + userType;

                setStudentConnectionStatus(session, userId, true);

                socket.emit(infoEvent, session, 'welcome', formatMessage(user, getWelcomeMessage(session)));
                console.log(`${socket.id}: Successfully joined ${session}.`)
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
                // populateToType(socket, session, INVIL_TYPE);
                // if (userType == INVIL_TYPE) {
                //     // console.log('populating studentUser')
                //     populateToType(socket, session, STU_TYPE);
                // }
                var infoType = 'userJoined'
                var info = formatMessage(user, getJoinMessage(user.username));
                broadcastInfoToType(session, INVIL_TYPE, infoType, info);
                if (userType == INVIL_TYPE) {
                    broadcastInfoToType(session, STU_TYPE, infoType, info);
                }
                chatUserIdToSocketsMap[userId] = socket;
            }

            function handleReceivedMessage(msg, sendAsAnnouncement, stream='', examStartInstruction='') {
                const sender_userId = msg.userId;
                const dest_sessions = msg.sessions;
                const dest_id = msg.destId;
                if (!isValidUserIdAndSessions(socket, sender_userId, dest_sessions, sendAsAnnouncement)) { 
                    return; 
                }
                // console.log('dest_sessions', dest_sessions);
                for (i in dest_sessions) {
                    // console.log('session', dest_sessions[i]);
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
                    } else if (examStartInstruction != '' && userType == STU_TYPE) {
                        continue;
                    }

                    const senderUserName = getUserName(sender_userId);
                    if (userType == INVIL_TYPE) {
                        sendMessageFromInvigilator(senderUserName, dest_id, session, msg, sendAsAnnouncement, stream, examStartInstruction);
                    } else {
                        sendMessageFromStudent(senderUserName, dest_id, session, msg, stream);
                    }
                }
                    // io.to(user.session).emit(chatMsgEvent, msg);   
            }

            // ss(socket).on(mediaMsgEvent, function(stream, msg) {
            //     stream.pipe(fs.createWriteStream('example_name.avi'));
            // });

            function removeUserSocket(socket, leftUser) {
                chatSocketIds.delete(socket.id);
                // io.to(user.session).emit(infoEvent, session, 'userLeft', formatMessage(leftUser, getLeftMessage(leftUser.username)));
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
            }

            function ensureAddedSocketEventListenersExist(socketId) {
                if (addedChatSocketEventListeners[socketId] == undefined) {
                    addedChatSocketEventListeners[socketId] = {
                        mediaMessageEvent: false,
                        messageEvent: false,
                        disconnectEvent: false,
                        recordingEvent: false,
                        populationEvent: false
                    }
                }
            }

            if (addedChatSocketEventListeners[socket.id] != undefined) {
                console.log(`${socket.id}: socket successfully joined.`);
            }

            if (addedChatSocketEventListeners[socket.id] == undefined || !addedChatSocketEventListeners[socket.id].populationEvent) {
                addPopulationSocketListeners(socket, sendConnectedUsersIn);
                ensureAddedSocketEventListenersExist(socket.id);
                addedChatSocketEventListeners[socket.id].populationEvent = true;
            }

            if (addedChatSocketEventListeners[socket.id] == undefined || !addedChatSocketEventListeners[socket.id].recordingEvent) {
                addRecordingSocketListeners(socket, handleReceivedMessage);
                ensureAddedSocketEventListenersExist(socket.id);
                addedChatSocketEventListeners[socket.id].recordingEvent = true;
            }

            if (addedChatSocketEventListeners[socket.id] == undefined || !addedChatSocketEventListeners[socket.id].mediaMessageEvent) {
                ss(socket).on(mediaMsgEvent, function(stream, msg, sendAsAnnouncement) {
                    console.log(`${socket.id}: Media stream received:`, msg);
                    handleReceivedMessage(msg, sendAsAnnouncement, stream);
                });
                ensureAddedSocketEventListenersExist(socket.id);
                addedChatSocketEventListeners[socket.id].mediaMessageEvent = true;
            }
            
            // User sends a message
            if (addedChatSocketEventListeners[socket.id] == undefined || !addedChatSocketEventListeners[socket.id].messageEvent) {
                socket.on(chatMsgEvent, (msg, sendAsAnnouncement) => {
                    console.log(`${socket.id}: Message received:`, msg);
                    handleReceivedMessage(msg, sendAsAnnouncement);
                })
                ensureAddedSocketEventListenersExist(socket.id);
                addedChatSocketEventListeners[socket.id].messageEvent = true;
            }

            if (addedChatSocketEventListeners[socket.id] == undefined || !addedChatSocketEventListeners[socket.id].disconnectEvent) {
                socket.on('disconnect', () => {
                    console.log('socket ' + socket.id + ' disconnected.');
                    var leftUser = chatSocketIdsToUserMap[socket.id];
                    console.log('user left:', leftUser);
                    if (leftUser == undefined) { return; }

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
                    removeUserSocket(socket, leftUser);
                })
                ensureAddedSocketEventListenersExist(socket.id);
                addedChatSocketEventListeners[socket.id].disconnectEvent = true;
            }
        } catch (err) {
            console.log(err);
            socket.emit(chatErrorEvent, 'An error occured: ' + err);
        }
    })
};

module.exports = {configureChatSessionLogic};