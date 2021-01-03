const {connectToDb} = require('./globals/db_globals');
const {createNewExamManager, init} = require('./session_logic/exam_manager');

// Array of ExamManagers
const managerMap = new Array();

initiateExam('TheFirstTest');

function initiateExam(testAlias) {
    var examManager = createNewExamManager(testAlias);
    examManager.conn.once('connected', async function() {
        try {
          await init(examManager);
          console.log("manager: ", examManager);
        }
        catch(e) {
          console.error(e);
        } 
    })
    managerMap.push(examManager);
}