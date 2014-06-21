var express = require('express');
var util = require('util');
var async = require('async');
var router = express.Router();
var logger = require('log4js').getLogger('fm.payments');
var constants = require('../fmconstants');
var paymentsHeader = {date: 1, dues: 1, amount: 1, method: 1, confirm: 1};
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
				dataMgr.getPaymentsForUserId(objTop.payload.id, callback);
			},
		    function(callback) {
				dataMgr.getAllDues({name:'.'},callback);// dot in a projection is a special case, it will return just the value and not an object
		    }
		], function(err,results){
			var user=results[0];
			var payments=results[1];
			var allDues=results[2];
			logger.trace('payments callback: ' + util.inspect(err) + ',' + util.inspect(results));
			res.render('payments', {
				navbar: constants.getNavbar('payments'),
				user: user,
				paymentsHeader: paymentsHeader,
				paymentsData: payments,
				dues: req.query.dues,
				allDues: allDues
			});
		});
	});
});

/*POST OAuth*/
router.post('/insert_payment', function(req, res) {
	req.app.get('authhelper').verifyAndHandleAuthentication(req.cookies.tokens, req, res, function(errTop,objTop) {
		logger.trace('objTop: ' + util.inspect(objTop));
		var dataMgr = req.app.get('dataMgr');
		logger.trace('post called: ');
		//logger.trace(util.inspect(req,{depth:null}));
		logger.trace(req.body);
		//req.app.get('dataMgr').db.insertExpense()
		dataMgr.db.payments.insert(req.body, function(err, obj) {
			if(err) {
				throw err;
			}
			else {
				logger.trace("insert response: " + util.inspect(obj));
			}
			res.redirect('/payments');//add option to fill in event automatically
		});
	});
});
module.exports = router;
