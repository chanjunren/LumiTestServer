const csv = require('csvtojson');
const fs = require('fs'); // For creating read and write streams
const {sessionIdKey, invilIdKey, invilPwKey, stuIdKey, stuPwKey} = require('../globals/csv_headers.js');
const {getConnection} = require("../globals/db_globals.js");
const { getAccountsModel, INVIL_TYPE, STU_TYPE } = require("../models/db_schemas.js");
const mongoose = require('mongoose');

test_run();

async function test_run() {
  try {
    let dirPath = '/home/tootie/Desktop/Projects/LumiTestServer/src/utils/TheFirstTest/';
    let testAlias = getTestAlias(dirPath);
    let conn = getConnection(testAlias);
    conn.once('connected', async function() {
      await uploadAllSessionsToDb(conn, dirPath);
    });
  } catch(err) {
    console.error("Error:", err)
  }
}

function getTestAlias(dirPath) {
  var segments = dirPath.replace(/\/+$/, '').split('/');
  var testAlias = (segments.length > 0) ? segments[segments.length - 1] : "";
  return testAlias;
}

async function uploadAllSessionsToDb(connection, dirPath) {
  fs.readdir(dirPath, function(err, directory) {
    if (err) {
        return console.error(err);
    }
    directory.forEach(async function (fileName) {
        var filePath = dirPath + "/" + fileName;

        let details = await extractInfoFromSessionCsv(filePath);
        await uploadSessionAccsToDb(connection, details);
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

async function uploadSessionAccsToDb(connection, details) {
  const {sessionId, invilAccs, stuAccs} = details;
  var accountDetails = getAccountsModel(connection);

  for (const [id, pw] of invilAccs.entries()) {
    var newAcc = new accountDetails({
      sessionIdx: sessionId,
      id: id,
      pw: pw, 
      type: INVIL_TYPE
    })
    await newAcc.save(function (err, doc) {
      if (err) {
        console.error(err);
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
