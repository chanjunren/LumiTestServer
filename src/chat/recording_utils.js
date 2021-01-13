const { STU_TYPE, INVIL_TYPE } = require("../models/db_schemas");
const { studentIdAndSessionEvent, examStartInstruction, examStopInstruction, 
        recordingsStartedResponse, recordingsStoppedResponse } = require('../globals/recording_globals');
const { getUserType, isValidUserIdAndSessions } = require('../chat/chat_utils');
const { populateUsersEvent } = require('../globals/chat_globals');

function addRecordingSocketListeners(socket, handleReceivedMessage) {
    socket.on(studentIdAndSessionEvent, function(msg) {
        const sender_userId = msg.userId;
        const dest_sessions = msg.sessions;
        const dest_id = msg.destId;
        if (!isValidUserIdAndSessions(socket, sender_userId, dest_sessions, '')) { 
            return; 
        }
        var session = dest_sessions[0];
        const userType = getUserType(session, sender_userId);
        if (userType != INVIL_TYPE) {
            return;
        }

        var testAlias = session;
        var masterList = managerMap.get(testAlias).masterList;
        var obj = {}
        for (let [k,v] of masterList) {
            if (v.type == "STU") {
                obj[k] = v.sessionIdx;
            }
        }
        socket.emit(studentIdAndSessionEvent, obj);
    })

    socket.on(examStartInstruction, (msg, sendAsAnnouncement, stream) => {
        console.log(`${socket.id}: Start clicked`);
        handleReceivedMessage(msg, sendAsAnnouncement, stream, examStartInstruction);
    });

    socket.on(examStopInstruction, (msg, sendAsAnnouncement, stream) => {
        console.log(`${socket.id}: Stop clicked`);
        handleReceivedMessage(msg, sendAsAnnouncement, stream, examStopInstruction);
    });

    // socket.on(recordingsStarted, (msg, sendAsAnnouncement, stream) => {
    //     handleReceivedMessage(msg, sendAsAnnouncement, stream, '', recordingsStarted);
    // });

    // socket.on(recordingsStopped, (msg, sendAsAnnouncement, stream) => {
    //     handleReceivedMessage(msg, sendAsAnnouncement, stream, '', recordingsStopped);
    // });

}

function addPopulationSocketListeners(socket, sendConnectedUsersIn) {
    socket.on(populateUsersEvent, function(msg) {
        const sender_userId = msg.userId;
        const dest_sessions = msg.sessions;
        const dest_id = msg.destId;
        if (!isValidUserIdAndSessions(socket, sender_userId, dest_sessions, '')) { 
            return; 
        }
        var session = dest_sessions[0];
        const userType = getUserType(session, sender_userId);
        if (userType == INVIL_TYPE) {
            // console.log('populating studentUser')
            sendConnectedUsersIn(socket, INVIL_TYPE, STU_TYPE);
        } else {
            sendConnectedUsersIn(socket, INVIL_TYPE)
        }
    })
}

module.exports = { addRecordingSocketListeners, addPopulationSocketListeners };