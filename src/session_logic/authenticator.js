var method = Authenticator.prototype;

function Authenticator(masterList) {
    this._masterList = masterList;
}

method.isValidId = function(userId) {
    return this._masterList.has(userId);
}

method.isValidPw = function(userId, pw) {
    return this._masterList.get(userId).password == pw;
}