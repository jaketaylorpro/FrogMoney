var express = require('express');
var constants = require('../fmconstants');
var router = express.Router();
var log4js = require('log4js');
var logger = log4js.getLogger('fm.logout');
/* GET home page. */
router.get('/', function(req, res) {
	logger.trace('logout called');
	for(var i in constants.cookieNames) {
		logger.trace('deleting cookie: ' + constants.cookieNames[i]);
		res.clearCookie(constants.cookieNames[i]);
	}
	res.redirect('/');
});

module.exports = router;
