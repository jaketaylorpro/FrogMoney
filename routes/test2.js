var express = require('express');
var util = require('util');
var logger = require('log4js').getLogger('fm.test');
var constants = require('../fmconstants');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {
	req.app.get('authhelper').verifyAuthentication(req.cookies.tokens, function(err,obj) {
		if(err) {
			logger.trace('authenticationFailed: ' + err);
			res.redirect('/?warning=verificationFailed');
		}
		else {
			res.render('test2', {
				navbar: constants.getNavbar('test2')
			});
		}
	});
});
module.exports = router;