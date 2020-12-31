const mongoose = require('mongoose');

// Schema for test details
const testDetailsSchema = new mongoose.Schema({
    testAlias: String,
    testPw: String, 
    adminPw: String,
    date: String,
    duration: Number
})


testDetailsSchema.methods.overview = function() {
    const overview =  `=== ${this.testAlias} OVERVIEW ===
        testPw: ${this.testPw}
        adminPw: ${this.adminPw}
        date: ${this.date}
        duration: ${this.duration}`;
    console.log(overview);
}

const testDetails = mongoose.model('Test_Details', testDetailsSchema);

// Schema for test details
const sessionDetailsSchema = new mongoose.Schema({
    invilList: [String],
    studentList: [String], 
    sessionIndex: Number
})

sessionDetailsSchema.index({sessionIndex: 1}, {unique: true});

sessionDetailsSchema.methods.overview = function() {
    const overview =  `SESSION OVERVIEW
    == Invil List ==
    ${this.invilList}
    == Student List ==
    ${this.studentList}`;
    console.log(overview);
}

const sessionDetails = mongoose.model('Session_Details', sessionDetailsSchema);

module.exports = {sessionDetails, testDetails}