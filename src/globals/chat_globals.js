const moment = require('moment');

const chatUrl = 'http://localhost:5000';
const chatMsgEvent = 'chatMessage';
const joinEvent = 'joinSession';

function getWelcomeMessage(testAlias) {
    return `Welcome to ${testAlias}`;
}

function getJoinMessage(username) {
    return `${username} has joined...`;
}

function formatMessage(username, msg) {
    return {
        username: username,
        body: msg,
        time: moment().format('h:mm a')
    }
}

module.exports = {chatUrl, joinEvent, chatMsgEvent, formatMessage, getWelcomeMessage, getJoinMessage};