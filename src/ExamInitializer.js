const csv = require('csvtojson');
const fs = require('fs'); // For creating read and write streams
const {sessionIdKey, invilIdKey, invilPwKey, stuIdKey, stuPwKey} = require('../src/utils/CsvHeaders.js');
const { connectToDb, disconnectFromDb } = require("./globals/db_globals.js");
const { accountDetails, INVIL_TYPE, STU_TYPE } = require("./globals/db_schemas.js");
const mongoose = require('mongoose');
const connection = mongoose.connection;

test_run();

async function test_run() {
  try {
    let dirPath = '/home/tootie/Desktop/Projects/LumiTestServer/src/utils/TheFirstTest/';
    let testAlias = getTestAlias(dirPath);
    connectToDb(testAlias)
    
    connection.once('connected', async function() {
      await uploadAllSessionsToDb(dirPath);

    });
    //disconnectFromDb();

  } catch(err) {
    console.error("Error:", err)
  }
}

function getTestAlias(dirPath) {
  var segments = dirPath.replace(/\/+$/, '').split('/');
  var testAlias = (segments.length > 0) ? segments[segments.length - 1] : "";
  return testAlias;
}

async function uploadAllSessionsToDb(dirPath) {
  fs.readdir(dirPath, function(err, directory) {
    if (err) {
        return console.error(err);
    }
    directory.forEach(async function (fileName) {
        var filePath = dirPath + "/" + fileName;

        let details = await extractInfoFromSessionCsv(filePath);
        await uploadSessionAccsToDb(details);
    })
})
}

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

async function uploadSessionAccsToDb(details) {
  const {sessionId, invilAccs, stuAccs} = details;
  for (const [id, pw] of invilAccs.entries()) {
    var newAcc = new accountDetails({
      sessionIdx: sessionId,
      id: id,
      pw: pw, 
      type: INVIL_TYPE
    })
    await newAcc.save(function (err, doc) {
      if (err) {
        throw err;
      }
      console.log("Succesfully uploaded account");
    });
  }
  
  for (const [id, pw] of stuAccs.entries()) {
    var newAcc = new accountDetails({
      sessionIdx: sessionId,
      id: id,
      pw: pw, 
      type: STU_TYPE
    })
    await newAcc.save(function (err, doc) {
      if (err) {
        throw err;
      }
      console.log("Succesfully uploaded account");
    });
  }
}