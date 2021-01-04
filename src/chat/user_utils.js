// const users = [];

var invilUserType = 'invil'
var studentUserType = 'student'

// To be replaced with database
userIdToUserName = {'e0123123': 'Abc \'def', 'e0123124': 'Alice', 'e0123125': 'Bob', 
                    'invil1': 'Prof Tan', 'invil2': 'Mr Wang'};
function getUserName(userId) {    
    return userIdToUserName[userId];
}

userIdToUserType = {'e0123123': studentUserType, 'e0123124': studentUserType, 'e0123125': studentUserType, 
                    'invil1': invilUserType, 'invil2': invilUserType};
function getUserType(userId) {
    return userIdToUserType[userId];
}

sessionToUserIds = {'exampleSession': {'e0123123': 1, 'e0123124': 1, 'e0123125': 1, 
                    'invil1': 1, 'invil2': 1}};
function isValidUser(userId, session) {
    return sessionToUserIds[session] != undefined && sessionToUserIds[session][userId] != undefined;
}

invilToSessionIds = {'invil1': ['exampleSession', 'exampleSession2'], 'invil2': ['exampleSession']}
function getInvilSessions(invilId) {
    return invilToSessionIds['invil1'];
}

//

const chatErrorEvent = 'chatError';

function getInvalidUserMessage(userId, session) {
    return (`Unable to validate user ID ${userId} and session ${session}. `
            + 'Please contact system administrator before restarting the application.');
}

function isValidUserIdAndSessions(socket, userId, sessions) {
    var isValid = true;
    for (i in sessions) {
        if (!isValidUser(userId, sessions[i])) {
            socket.emit(chatErrorEvent, getInvalidUserMessage(userId, sessions[i]));
            isValid = false;
        }
    }
    // console.log(isValid);
    return isValid;
}

function userJoin(id, userId, sessions) {
    var username = getUserName(userId);
    var userType = getUserType(userId);
    const user = {id, userId, username, userType, sessions};
    // users.push(user);
    return user;
}

function getCurrentUser(id) {
    // return users.find(user => user.id == id);
}

module.exports = {userJoin, getCurrentUser, getUserName, getUserType, getInvilSessions, isValidUser, isValidUserIdAndSessions};