// var EXPLORER_URL = 'https://explorer.as.hdactech.com/insight-api';
var EXPLORER_URL = 'http://13.209.36.54:8080/insight-api';

function BLOCKEXPLORER (endpoints) {
    this.rootUrl = EXPLORER_URL;
    this.endpoints = endpoints
}

module.exports = BLOCKEXPLORER
