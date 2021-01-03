
const {getConnection} = require('../globals/db_globals');
const {getAccountsModel} = require('../models/db_schemas');

function createNewExamManager(testAlias) {
    const examManager = {
        testAlias: testAlias,
        conn: getConnection(testAlias),
        masterList: new Map(),
    }
    return examManager;    
}

async function init(examManager) {
    let accounts = await retrieveMasterList(examManager.conn);
    for (account of accounts) {
        examManager.masterList.set(account.id, {
            sessionIdx: account.sessionIdx,
            pw: account.pw,
            type: account.type
        })
    }
}

function retrieveMasterList(connection) {
    return getAccountsModel(connection).find({});
}

function showStatsOf(examManager) {
    console.log("TEST: ", examManager.testAlias);
    console.log("Master List:", examManager.masterList);
}

module.exports = {createNewExamManager, init, showStatsOf};
