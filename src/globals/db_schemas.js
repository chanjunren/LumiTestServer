const mongoose = require('mongoose');
// Schema for test details

const INVIL_TYPE = "INVIL";
const STU_TYPE = "STU";
const C_INVIL_TYPE = "C_INVIL";
const ACC_TYPES = [INVIL_TYPE, STU_TYPE, C_INVIL_TYPE];

const accountSchema = new mongoose.Schema({
    sessionIdx: Number,
    id: String,
    pw: String, 
    type: {type: String, enum: ACC_TYPES}
})

accountSchema.index({sessionIdx: 1});

accountSchema.methods.overview = function() {
    const overview =  `Session: ${this.sessionIdx} | Type: ${this.type} | Id: ${this.id} | Pw: ${this.pw}`;
    console.log(overview);
}

const accountDetails = mongoose.model('Accounts', accountSchema);

module.exports = {accountDetails, INVIL_TYPE, STU_TYPE}