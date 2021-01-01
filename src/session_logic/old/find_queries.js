const {test, submission, connectToDb} = require('../../../../globals/db_globals.js')

// Establishing conection to database
connectToDb();
const submission_query_obj = submission.find({test_id:"ay20/21s1cs3103"}, function (err, docs) {
    if (err) {
        return console.error(err);
    }
    console.log('submission_query_obj docs', docs);
});

const test_query_obj = test.find({test_id:"ay20/21s1cs3103"}, function (err, docs) {
    if (err) {
        return console.error(err);
    }
    console.log('test_query_obj docs', docs);
});
