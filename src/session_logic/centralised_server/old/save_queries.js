const {test, submission, connectToDb} = require('../../../../globals/db_globals.js')

connectToDb();

const cs3103_test = new test({
    test_id: "ay20/21s1cs3103",
    date: "06122020",
    duration: "1 hr 30 mins",
})

const submission_1 = new submission({
    test_id: "ay20/21s1cs3103",
    date: "06122020",
    student_id: "A0182514J",
    index: 0
})

const submission_2 = new submission({
    test_id: "ay20/21s1cs3103",
    date: "06122020",
    student_id: "A0HILOL123J",
    index: 0
})

cs3103_test.save(function (err, test) {
    if (err) {
        return console.error(err);
    }
    console.log("Added test:", test);
})

submission_1.save(function (err, submission) {
    if (err) {
        return console.error(err);
    }
    console.log("Added submission:", submission)
})

submission_2.save(function (err, submission) {
    if (err) {
        return console.error(err);
    }
    console.log("Added submission:", submission)
})

/*mongoose.disconnect().finally(() => {
    console.log('Disconnected from database.');
});*/