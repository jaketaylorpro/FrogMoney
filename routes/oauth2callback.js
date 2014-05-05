var express = require('express');
var log4js = require('log4js');
var util = require('util');
var router = express.Router();
var logger = log4js.getLogger('fm.oauth2callback');
/* GET users listing. */
router.get('/', function(req, res) {
	var code = req.query.code;
	logger.trace('got code' + code);
	var oauth2Client = req.app.get('authhelper').newOAuth2Client();
	oauth2Client.getToken(code, function(err, tokens) {
		var locals = {
			code: code,
			tokens: tokens
		};
		if(err) {
			throw err;
		}
		else {
			logger.trace('got tokens' + util.inspect(tokens));
			req.app.get('authhelper').getUserInfo(tokens, function(err, obj) {
				if(err) {
					throw err;
				}
				else {
					logger.trace('got userInfo reply' + util.inspect(obj));
					res.cookie('tokens', tokens);
					res.cookie('id', obj.id);
					req.app.get('dataMgr').db.users.update({id: obj.id}, obj, {upsert: true}, function(err, obj) {
						if(err) {
							throw err;
						}
						else {
							logger.trace('saved userInfo to DB');
							res.redirect('../home');
						}
					});

				}
			});
		}
	});
});
module.exports = router;
