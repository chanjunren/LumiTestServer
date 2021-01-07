const {JOIN_SESSION_REQ, LOGIN_RESP} = require('../globals/connection');
const {INVIL_TYPE} = require('../models/db_schemas');

function setStudentConnectionStatus(testAlias, id, studentIsConnected) {
    var td = document.getElementById(`${testAlias}-${id}-status`);
    // console.log(td, `${testAlias}-${id}-status`);
    if (td == undefined) { return; }
    var color = studentIsConnected ? "green" : "red";
    td.style = `color: ${color}; font-weight: bold`;
    td.innerText = studentIsConnected ? "True" : "False";
}

async function configureSessionLogic(socket) {
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

        setStudentConnectionStatus(testAlias, id, true);

        return manager.masterList.get(id).type == INVIL_TYPE 
               ? socket.emit(LOGIN_RESP, "INVIL_LOGIN_OK")
               : socket.emit(LOGIN_RESP, "STU_LOGIN_OK");
    })
}

module.exports = {configureSessionLogic, setStudentConnectionStatus};