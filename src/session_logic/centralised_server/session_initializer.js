const {connectToDb, testQnBucket} = require('../../../globals/db_globals.js');
const {testDetails} = require('../../../globals/db_schemas.js');
const fs = require('fs'); // For creating read and write streams
const mongoose = require('mongoose');
const connection = mongoose.connection;

connectToDb("hiitsjr");

connection.once('connected', async function() {
    /*const masterList = await getMasterList();
    console.log(masterList);*/

    const newTest = await postNewTestToDb("hiitsjr", "hehe!", 'C:/Projects/ay2021-cs3103-group-9/Examiner/encrypted.csv', "itsasecret", "today lol", 10)
    console.log(newTest);

    /*const newSession = await addSession(["lol 1", "lol 2", "lol 3", "Invil 4", "Invil 5"], ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5"])
    console.log(newSession);*/

    /*const testDetails = await getTestDetails();
    console.log(testDetails);*/

    /*const updatedDetail = await updateTestDetail({testAlias: "poggie woggie123!"})
    console.log(updatedDetail);*/

    /*  const sessionDetails = await getSessionDetails(10); // Returns empty
    console.log(sessionDetails);*/
})

async function postNewTestToDb(testAlias, testPw, qnFilePath, adminPw, date, dur) {
    var newTest = new testDetails({
        testAlias: testAlias,
        testPw: testPw,
        adminPw: adminPw,
        date: date,
        duration: dur
    })
    newTest = await newTest.save();
    var bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: testQnBucket
    });

    fs.createReadStream(qnFilePath).
    pipe(bucket.openUploadStream(testAlias + "_test_file.csv")).
    on('error', function(error) {
        console.error(error);
    }).
    on('finish', function() {
        console.log('Test file uploaded!');
    });
    return newTest;
}

async function addSession(invilList, stuList) {
    try {
        const count = await sessionDetails.countDocuments({});
        var newSession = new sessionDetails({
            invilList: invilList,
            studentList: stuList,
            sessionIndex: count + 1
        })
        newSession = await newSession.save();
        return newSession;
    } catch (err) {
        console.error(er);
    }
}

// To edit
async function updateTestDetail(detailMap) {
    // Filter is empty because the testDetails collection should only have 1 document
    try {
        var updatedDetails = await testDetails.updateOne({}, detailMap);
        return updatedDetails;
    } catch (err) {
        console.error(err);
    }
}

async function getTestDetails() {
    try {
        var details = await testDetails.find({});
        return details;
    } catch (err) {
        console.error(err);
    }
    
}    
    
function updateSessionDetails(index, detailMap) {
    // Filter is empty because the testDetails collection should only have 1 document
    sessionDetails.updateOne({sessionIndex: index}, detailMap, function(err, docs) {
        if (err) {
            return console.error(err);
        }
        if (docs.nModified != 1) {
            return console.error("Session details not modified!");
        }
        getSessionDetails(index);
        console.log("Session details successfully updated");
    })
}

// Aggregation
async function getMasterList(testAlias) {
    try {
        const sessionDocuments = await sessionDetails.find({});
        const sessionMap = new Map();
        sessionDocuments.forEach(function(session) {
            sessionMap.set(session.sessionIndex, {
                invilList: session.invilList, 
                studentList: session.studentList
            });
        })
        return sessionMap;
    } catch (err) {
        console.error(err);
    }
}

async function getSessionDetails(index) {
    try {
        var details = await sessionDetails.find({sessionIndex: index});
        return details;
    } catch (err) {
        console.error(err);
    }
}