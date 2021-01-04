const moment = require('moment');

const chatUrl = 'http://localhost:5000';
const chatMsgEvent = 'chatMessage';
const infoEvent = 'infoText';
const joinEvent = 'joinSession';
const populateUsersEvent = 'populateUsers';
const chatErrorEvent = 'chatError';

const invilUserType = 'invil'
const studentUserType = 'student'

function getWelcomeMessage(testAlias) {
    return `Connected to ${testAlias}.`;
}

function getJoinMessage(username) {
    return `${username} has joined the session.`;
}

function getLeftMessage(username) {
    return `${username} has left the session.`
}

function getInvalidUserMessage(userId, session) {
    return (`Unable to validate user ID ${userId} and session ${session}. `
            + 'Please contact system administrator before restarting the application.');
}

function formatMessage(user, msg) {
    return {
        user: user,
        body: msg,
        time: moment().format('h:mm a')
    }
}

module.exports = {chatUrl, joinEvent, chatMsgEvent, infoEvent, populateUsersEvent, invilUserType, studentUserType,
                  formatMessage, getWelcomeMessage, getJoinMessage, getLeftMessage, getInvalidUserMessage};