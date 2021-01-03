const PORT = 5000;

const joinSessionReq = "letMeInPlease";
const serverMsg = "theBossGotSthToSay"

function getRoom(testAlias, sessionIndx) {
    return `${testAlias}:${sessionIndx}`;
}

module.exports = {PORT, joinSessionReq, serverMsg, getRoom};