const users = [];

function userJoin(id, username, session) {
    const user = {id, username, session};
    users.push(user);
    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id == id);
}

module.exports = {userJoin, getCurrentUser};