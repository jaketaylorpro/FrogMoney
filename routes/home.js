var express = require('express');
var moment = require('moment');
var util = require('util');
var async = require('async');
var router = express.Router();
var logger = require('log4js').getLogger('fm.home');
var constants = require('../fmconstants');
/* GET users listing. */
router.get('/', function(req, res) {
	req.app.get('authhelper').verifyAndHandleAuthentication(req.cookies.tokens, req, res, function(errTop,objTop) {

		logger.trace('objTop: ' + util.inspect(objTop));
		async.parallel([
			               function(callback) {
				               req.app.get('dataMgr').getUserById(objTop.payload.id, function(err, obj) {
					               logger.trace('user results: ' +
					                            moment().toISOString() +
					                            ': ' +
					                            util.inspect(err) +
					                            ',' +
					                            util.inspect(obj));
					               callback(err, obj);
				               });
			               }, function(callback) {
									req.app.get('dataMgr').getExpensesForUserId(objTop.payload.id, function(err, obj) {
										logger.trace('expenses results: ' +
										             moment().toISOString() +
										             ': ' +
										             util.inspect(err) +
										             ',' +
										             util.inspect(obj));
										callback(err, obj);
									});
								}, function(callback) {
									req.app.get('dataMgr').getPaymentsForUserId(objTop.payload.id, function(err, obj) {
										logger.trace('payments results: ' +
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
				navbar: constants.getNavbar('home'),
				user: results[0],
				expenses: results[1]
				payments: results[2]
			});
		});
	});
});
module.exports = router;