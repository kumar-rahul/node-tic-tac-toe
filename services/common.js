const uuidv1 = require("uuid/v1");

var commonService = {};
var generateUUID = function() {
  return uuidv1();
};

commonService = {
  generateUUID
};
module.exports = commonService;
