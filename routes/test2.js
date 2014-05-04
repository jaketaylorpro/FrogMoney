var express = require('express');
var logger = require('log4js').getLogger('fm.test');
var constants = require('../fmconstants');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {

	req.app.get('authhelper').authenticate(req.cookies.tokens, function() {
		logger.info(util.inspect(err));
		logger.info(util.inspect(obj));
		res.render('test2', {
			navbar: constants.getNavbar('test2'),
			time: moment().toISOString()
		});
	}, function(err) {
		logger.trace('authenticationFailed: ' + err);
		res.redirect('/?warning=authenticationFailed');
	});
});
module.exports = router;