const expressApp = require('express')();
const http = require('http').createServer(expressApp);
const io = require('socket.io')(http);

io.setMaxListeners(0);
io.sockets.setMaxListeners(0);

const {getAllDbs} = require('../globals/db_globals');
const {initiateExam} = require('../session_logic/exam_manager');
const {configureSessionLogic, setStudentConnectionStatus} = require('../session_logic/session_socket_logic');
const {configureChatSessionLogic} = require('../chat/chat_server')
const {configureFileReceivingSessionLogic} = require('../recordings/socket_file_retrieval')

const {PORT} = require('../globals/connection');

const initiateExamBtn = document.getElementById("initiate-btn");
const testAliasInput = document.getElementById("test-alias-input");
const examTables = document.getElementById("exam-tables");
const output = document.getElementById("output-display");
const ongoingList = document.getElementById("ongoing-list");

var ongoingExams = [];
var managerMap = new Map(); // Array of ExamManagers
var curr = 0;

const chatGlobals = {
  chatSocketIds: new Set(),
  chatSocketIdsToUserMap: {},
  chatUserIdToSocketsMap: {},
  chatRoomsToSocketIdsMap: {},
  chatSocketIdsToRoomsMap: {},
  addedChatSocketEventListeners: {}
}

const recordingGlobals = {
  addedRecordingSocketEventListeners: {}
}

initiateExamBtn.addEventListener("click", runInitiateExamProcess);
testAliasInput.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    runInitiateExamProcess();
  }
});

async function runInitiateExamProcess() {
  var testAlias = testAliasInput.value;
  if (testAlias.trim() == '') { return; }
  testAliasInput.value = "";
  output.innerText = "";
  try {
    await initiateExam(testAlias, managerMap);
    ongoingExams.push(`${testAlias}`);
    outputExam(testAlias);
  } catch (e) {
    outputErrorMsg(e);
  }
}

function showPrev() {
  console.log("prev clicked");
  if (curr == 0 || ongoingExams.length == 1) {
    return;
  }
  document.getElementById(`${ongoingExams[curr]}-li`).style.fontWeight = "normal";
  document.getElementById(`${ongoingExams[curr--]}-exam-table`).style.display = "none";

  document.getElementById(`${ongoingExams[curr]}-li`).style.fontWeight = "bold";
  document.getElementById(`${ongoingExams[curr]}-exam-table`).style.display = "inline";
}

function showNext() {
  console.log("next clicked");
  if (curr == ongoingExams.length - 1 || ongoingExams.length == 1) {
    return;
  }
  console.log(`${ongoingExams[curr]}-li`);
  document.getElementById(`${ongoingExams[curr]}-li`).style.fontWeight = "normal";
  document.getElementById(`${ongoingExams[curr++]}-exam-table`).style.display = "none";

  document.getElementById(`${ongoingExams[curr]}-li`).style.fontWeight = "bold";
  document.getElementById(`${ongoingExams[curr]}-exam-table`).style.display = "inline";
}


function outputErrorMsg(msg) {
  output.innerText = msg;
}

function outputExam(testAlias) {
  // Adding to ongoing list
  const newLi = document.createElement('li');
  newLi.id = `${testAlias}-li`;
  newLi.innerText = testAlias;

  const examTable = document.createElement('table');
  examTable.id = `${testAlias}-exam-table`;
  examTable.style.display = "none";
  if (ongoingExams.length == 1) {
    examTable.style.display = "inline";
    newLi.style.fontWeight = "bold";
  }
  examTable.classList.add('exam-table');
  examTable.innerHTML = `<thead>
    <tr>
      <th>Session</th>
      <th>Type</th>
      <th>Name</th>
      <th>Connected</th>
    </tr>
  </thead>
  <tbody>`;
  const masterList = managerMap.get(testAlias).masterList
  for (account of masterList) {
      examTable.innerHTML += `<tr>
      <td>${account[1].sessionIdx}</td>
      <td>${account[1].type}</td>
      <td>${account[0]}</td>
      <td id="${testAlias}-${account[0]}-status" style="color: red; font-weight:bold;">False</td>
    </tr>`
  }

  examTable.innerHTML += `</tbody>`

  ongoingList.appendChild(newLi);
  examTables.appendChild(examTable);
}

function addTestToDropdown(testAlias) {
  const newOption = document.createElement('option')
  newOption.innerText = testAlias;
  testAliasInput.appendChild(newOption);
}

// ---------- Listeners ----------
http.listen(PORT, () => {
  console.log("Listening on ", PORT);
})

io.on('connection', socket => {
  configureSessionLogic(socket);
  configureChatSessionLogic(socket, chatGlobals);
  configureFileReceivingSessionLogic(socket, recordingGlobals);
})

getAllDbs().then(dbs => {
  for (db of dbs) {
    if (db.name == "local" || db.name == "admin") {
      continue;
    }
    addTestToDropdown(db.name);
  }
})