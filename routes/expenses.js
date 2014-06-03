var express = require('express');
var util = require('util');
var async = require('async');
var router = express.Router();
var logger = require('log4js').getLogger('fm.expenses');
var constants = require('../fmconstants');
var expensesHeader = {date: 1, event: 1, amount: 1, description: 1};
/* GET expenses listing. */
router.get('/', function(req, res) {
	req.app.get('authhelper').verifyAndHandleAuthentication(req.cookies.tokens, req, res, function(errTop,objTop) {
		logger.trace('objTop: ' + util.inspect(objTop));
		var dataMgr=req.app.get('dataMgr');
		async.parallel([
			function(callback) {
				dataMgr.getUserById(objTop.payload.id, callback);
			},
			function(callback) {
				dataMgr.getExpensesForUserId(objTop.payload.id, callback);
			},
		    function(callback) {
				dataMgr.getAllEvents({name:'.'},callback);// dot in a projection is a special case, it will return just the value and not an object
		    }
		], function(err,results){
			var user=results[0];
			var expenses=results[1];
			var allEventNames=results[2];
			logger.trace('expenses callback: ' + util.inspect(err) + ',' + util.inspect(results));
			res.render('expenses', {
				navbar: constants.getNavbar('expenses'),
				user: user,
				expensesHeader: expensesHeader,
				expensesData: expenses,
				event: req.query.event,
				allEventNames: allEventNames
			});
		});
	});
});

/*POST OAuth*/
router.post('/insert_expense', function(req, res) {
	req.app.get('authhelper').verifyAndHandleAuthentication(req.cookies.tokens, req, res, function(errTop,objTop) {
		logger.trace('objTop: ' + util.inspect(objTop));
		var dataMgr = req.app.get('dataMgr');
		logger.trace('post called: ');
		//logger.trace(util.inspect(req,{depth:null}));
		logger.trace(req.body);
		//req.app.get('dataMgr').db.insertExpense()
		dataMgr.db.expenses.insert(req.body, function(err, obj) {
			if(err) {
				throw err;
			}
			else {
				logger.trace("insert response: " + util.inspect(obj));
			}
			res.redirect('/expenses');//add option to fill in event automatically
		});
	});
});
module.exports = router;
