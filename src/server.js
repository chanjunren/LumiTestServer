const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {createNewExamManager, init, showStatsOf} = require('./session_logic/exam_manager');

// Array of ExamManagers
const managerMap = new Array();

initiateExam('TheFirstTest');

function initiateExam(testAlias) {
    var examManager = createNewExamManager(testAlias);
    examManager.conn.once('connected', async function() {
        try {
          await init(examManager);
          console.log("=== Initiated ===")
          showStatsOf(examManager);
        }
        catch(e) {
          console.error(e);
        } 
    })
    managerMap.push(examManager);
}