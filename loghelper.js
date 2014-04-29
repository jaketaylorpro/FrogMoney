//var jsonfile = require('jsonfile');
var log4js = require('log4js');
//var config = jsonfile.readFileSync('json\\log4js.json');
log4js.configure('json\\log4js.json',{ reloadSecs: 300 });