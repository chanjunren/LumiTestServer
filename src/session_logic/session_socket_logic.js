const {JOIN_SESSION_REQ, LOGIN_RESP} = require('../globals/connection');
const {INVIL_TYPE} = require('../models/db_schemas');

function configureSessionLogic(socket) {
    socket.on(JOIN_SESSION_REQ, msg => {
        console.log("Msg recvd: ", msg);
        const {testAlias, id, pw} = msg;
        let manager = managerMap.get(testAlias);

        if (!managerMap.has(testAlias)) {
            return socket.emit(LOGIN_RESP, "INVALID_TEST_ALIAS");
        }

        if (!manager.validateId(manager.masterList, id)) {
            return socket.emit(LOGIN_RESP, "INVALID_ID");
        }
        if (!manager.validatePw(manager.masterList, id, pw)) {
            return socket.emit(LOGIN_RESP, "INVALID_PW");
        }

        var td = document.getElementById(`${testAlias}-${id}-status`);
        td.style = "color: green; font-weight: bold";
        td.innerText = "True"

        return manager.masterList.get(id).type == INVIL_TYPE ? socket.emit(LOGIN_RESP, "INVIL_LOGIN_OK")
            : socket.emit("STU_LOGIN_OK");
    })
}

module.exports = {configureSessionLogic};