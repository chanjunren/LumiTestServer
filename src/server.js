const expressApp = require('express')();
const http = require('http').createServer(expressApp);
const io = require('socket.io')(http);

const {PORT, joinSessionReq, getRoom, serverMsg} = require('./globals/connection');

const {createNewExamManager, init, showStatsOf} = require('./session_logic/exam_manager');

// Array of ExamManagers
const managerMap = new Map();

initiateExam('TheFirstTest');

function initiateExam(testAlias) {
    var examManager = createNewExamManager(testAlias);
    examManager.conn.once('connected', async function() {
        try {
          await init(examManager);
          // console.log("=== Initiated ===")
          // showStatsOf(examManager);
        }
        catch(e) {
          console.error(e);
        } 
    })
    managerMap.set(testAlias, examManager);
}

http.listen(PORT, () => {
  console.log("Listening on ", PORT);
})

io.once('connection', socket => {
  configureSessionLogic(socket);
})

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