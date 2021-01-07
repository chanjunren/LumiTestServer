// const users = [];

// var invilUserType = 'invil'
// var studentUserType = 'student'

// To be replaced with database
// userIdToUserName = {'e0123123': 'Abc \'def', 'e0123124': 'Alice A Very Very VeryVeryVeryVeryVeryLongName', 'e0123125': 'Bob', 
//                     'invil1': 'Prof Tan', 'invil2': 'Mr Wang', 'invil3': 'Ms Wendy'};
function getUserName(userId) {    
    return userId;
    // return userIdToUserName[userId];
}

// userIdToUserType = {'e0123123': studentUserType, 'e0123124': studentUserType, 'e0123125': studentUserType, 
//                     'invil1': invilUserType, 'invil2': invilUserType, 'invil3': invilUserType};
function getUserType(testAlias, userId) {
    return managerMap.get(testAlias).masterList.get(userId).type;
    // return userIdToUserType[userId];
}

// sessionToUserIds = {'exampleSession': {'e0123123': 1, 'e0123124': 1, 'e0123125': 1, 
//                     'invil1': 1, 'invil2': 1, 'invil3': 1}};
function isValidUser(userId, session) {
    var examManager = managerMap.get(session);
    return examManager != undefined && examManager.masterList.get(userId) != undefined;
    // return sessionToUserIds[session] != undefined && sessionToUserIds[session][userId] != undefined;
}

// invilToSessionIds = {'invil1': ['exampleSession', 'exampleSession2'], 'invil2': ['exampleSession']}
function getInvilSessions(invilId) {
    // return invilToSessionIds[invilId];
}

//

const chatErrorEvent = 'chatError';
// const requestAuthenticationError = 'requestAuthenticationError'

function getInvalidUserMessage(userId, session) {
    return (`Unable to validate user credentials for the session`);
}

function isValidUserIdAndSessions(socket, userId, sessions) {
    var isValid = true;
    for (i in sessions) {
        if (!isValidUser(userId, sessions[i])) {
            socket.emit(chatErrorEvent, getInvalidUserMessage(userId, sessions[i]));
            // console.log(`${socket.id} failed to authenticate.`)
            isValid = false;
        }
    }
    // console.log(isValid);
    return isValid;
}

function userJoin(id, userId, sessions) {
    var username = getUserName(userId);
    var userType = getUserType(sessions[0], userId); // Logic to be corrected.
    const user = {id, userId, username, userType, sessions};
    // users.push(user);
    return user;
}

function getCurrentUser(id) {
    // return users.find(user => user.id == id);
}

module.exports = {userJoin, getCurrentUser, getUserName, getUserType, getInvilSessions, isValidUser, isValidUserIdAndSessions};