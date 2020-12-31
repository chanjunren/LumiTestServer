const path = require('path');
const csv = require("csvtojson");

const EXEC_EXT = '.exe'
const sessionIdKey = "SESSION_ID";
const invilIdKey = "INVIL_ID";
const invilPwKey = "INVIL_PW";
const stuIdKey = "STU_ID";
const stuPwKey = "STU_PW";

async function extractInfoFromSessionCsv(filePath) {
  return csv()
    .fromFile(filePath)
    .then((jsonArr) => {
      let invilAccs = new Map();
      let stuAccs = new Map();
      let sessionId;
      for (let i = 0; i < jsonArr.length; i++) {
        if (i == 0) {
          sessionId = jsonArr[i][sessionIdKey];
        }
        invilAccs.set(jsonArr[i][invilIdKey], jsonArr[i][invilPwKey]);
        stuAccs.set(jsonArr[i][stuIdKey], jsonArr[i][stuPwKey]);
      }
      return {sessionId, invilAccs, stuAccs}  
    })
}

async function uploadSessionToDb(details) {
  const {sessionId, invilAccs, stuAccs} = details;
  
}

extractInfoFromSessionCsv('utils/sampleSession.csv').then(result => {
  console.log(result);
});

