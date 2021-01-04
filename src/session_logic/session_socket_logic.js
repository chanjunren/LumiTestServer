const {joinSessionReq, serverMsg} = require('../globals/connection');

function configureSessionLogic(socket) {
    socket.on(joinSessionReq, msg => {
        const {testAlias, id, pw} = msg;
        let manager = managerMap.get(testAlias);
        if (!manager.validateId(manager.masterList, id)) {
        console.log("pork");
        return socket.emit(serverMsg, "INVALID_ID");
        }
        if (!manager.validatePw(manager.masterList, id, pw)) {
        return socket.emit(serverMsg, "INVALID_PW");
        }
        return socket.emit(serverMsg, "LOGIN_SUCCESS");
    })
}

module.exports = {configureSessionLogic};