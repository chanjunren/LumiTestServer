const {getConnection} = require('../globals/db_globals');
const {getAccountsModel} = require('../models/db_schemas');

function createNewExamManager(testAlias) {
    const examManager = {
        conn: getConnection(testAlias),
    }
    return examManager;    
}

async function init(examManager) {
    examManager.masterList = await retrieveMasterList(examManager.conn);
}

function retrieveMasterList(connection) {
    return getAccountsModel(connection).find({});
}

module.exports = {createNewExamManager, init};
