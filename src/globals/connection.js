const PORT = 5000;

const JOIN_SESSION_REQ = "letMeInPlease";
const LOGIN_RESP = "theBossGotSthToSay"

function getRoom(testAlias, sessionIndx) {
    return `${testAlias}:${sessionIndx}`;
}

module.exports = {PORT, JOIN_SESSION_REQ, LOGIN_RESP, getRoom};