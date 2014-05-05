var express = require('express');
var moment = require('moment');
var util = require('util');
var async = require('async');
var router = express.Router();
var logger = require('log4js').getLogger('fm.home');
var constants = require('../fmconstants');
/* GET users listing. */
router.get('/', function(req, res) {
	async.parallel([
		               function(callback) {
			               req.app.get('dataMgr').getUserById(req.cookies.id, function(err, obj) {
				               logger.trace('user results: ' +
				                            moment().toISOString() +
				                            ': ' +
				                            util.inspect(err) +
				                            ',' +
				                            util.inspect(obj));
				               callback(err, obj);
			               });
		               }, function(callback) {
			req.app.get('dataMgr').getExpensesForUserId(req.cookies.id, function(err, obj) {
				logger.trace('expenses results: ' +
				             moment().toISOString() +
				             ': ' +
				             util.inspect(err) +
				             ',' +
				             util.inspect(obj));
				callback(err, obj);
			});
		}
	               ], function(err, results) {

		logger.trace('home callback: ' +
		             moment().toISOString() +
		             ': ' +
		             util.inspect(err) +
		             ',' +
		             util.inspect(results));
		res.render('home', {
			navbar: constants.getNavbar('expenses'),
			user: results[0],
			expenses: results[1]
		});
	});
});
module.exports = router;