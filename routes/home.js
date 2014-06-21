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
		var dataMgr=req.app.get('dataMgr');
		async.parallel([
           function(callback) {
				dataMgr.getUserById(objTop.payload.id, callback);
			}, function(callback) {
				dataMgr.getExpensesForUserId(objTop.payload.id, callback);
			}, function(callback) {
				dataMgr.getPaymentsForUserId(objTop.payload.id, callback);
			}, function(callback) {
				dataMgr.getTransfersForUserId(objTop.payload.id, callback);
			}, function(callback) {
				dataMgr.getDues(callback);
			}, function(callback) {
				dataMgr.getCurrentEvent(callback);
			}, function(callback) {
				dataMgr.getExpensesForCurrentEvent(callback);
			}
       ], function(err, results) {
			var user = results[0];
			var expenses = results[1];
			var payments = results[2];
			var transfers = results[3];
			var dues = results[4];
			var event = results[5];
			var eventExpenses = results[6];
			var sumCastFromString=function(prev,cur){
				return prev+parseFloat(cur.amount) || 0;//|| is like coalese
			};
			var totalPayments=payments.reduce(sumCastFromString,0);
			var totalExpenses=expenses.reduce(sumCastFromString,0);
			var totalTransfers=transfers.reduce(sumCastFromString,0);
			logger.info('event loaded: '+util.inspect(event));
			logger.info('expenses loaded: '+util.inspect(expenses));
			logger.info('eventExpenses loaded: '+util.inspect(eventExpenses));
			logger.info('totalExpenses loaded: '+util.inspect(totalExpenses));
			res.render('home', {
				navbar: constants.getNavbar('home'),
				user: user,
				numPayments:payments.length,
				numExpenses:expenses.length,
				numTransfers:transfers.length,
				totalPayments:totalPayments,
				totalExpenses:totalExpenses,
				totalTransfers:totalTransfers,
				numDues:dues.length,
				numDuesPaid:payments.length>0?payments.reduce(function(prev,cur){return prev+(cur.dueId == null ? 0: 1);}):0,
				event:event,
				eventExpenses:eventExpenses
			});
		});
	});
});
module.exports = router;