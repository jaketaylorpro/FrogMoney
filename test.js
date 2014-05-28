var util = require('util');
var moment = require('moment');
var async = require('async');
var logger = require('log4js').getLogger('fm.test');
var fs = require('fs');
var path = require('path');
//test to run
var db = setup();
parallelTest(db);
db = setup();
isAllowedTest(db);
db = setup();
getExpensesForUserIdTest(db);
teardown();
function setup() {
	teardown();
	var fs
.
	mkdir('db_test');
	return  require('./FmDataMgr')('db_test');
}
function teardown() {
	if(fs.existSync('db_test')) {
		var files = fs.readdirSync('db_test');
		files.map(function(file) {
			fs.rmSync('db_test' + path.sep + file);
		});
		fs.rmdirSync('db_test');
	}
}
//addEmails();
function parallelTest() {
	async.parallel([
		               function(callback) {
			               db.users.findOne({}, function(err, obj) {
				               logger.info('user results: ' +
				                           moment().toISOString() +
				                           ': ' +
				                           util.inspect(err) +
				                           ',' +
				                           util.inspect(obj));
				               callback(err, obj);
			               });
		               }, function(callback) {
			db.expenses.find({}, function(err, obj) {
				logger.info('expenses results: ' +
				            moment().toISOString() +
				            ': ' +
				            util.inspect(err) +
				            ',' +
				            util.inspect(obj));
				callback(err, obj);
			});
		}
	               ], function(err, results) {

		logger.info('home callback: ' +
		            moment().toISOString() +
		            ': ' +
		            util.inspect(err) +
		            ',' +
		            util.inspect(results));
	});
}
function isAllowedTest(db) {
	var testEmail = 'test@abc.com';
	db.members.insertSync({email: testEmail});
	db.isAllowed(db.memberIsAllowed(testEmail), function(err,obj) {
		             if(err) {
			             logger.error('isAllowedTest-base failed');
		             }
		             else {
			             if(obj)
			             {
				             logger.info('isAllowedTest-base passed');
			             }
			             else
			             {
				             logger.error('isAllowedTest-base failed, error: ' + util.inspect(err));
			             }
		             }
	             });
	db.isAllowed(db.memberIsAllowed('Test@abc.com'), function(err,obj) {
		             if(err) {
			             logger.error('isAllowedTest-case failed, error: ' + util.inspect(err));
		             }
		             else {
			             if(obj)
			             {
				             logger.info('isAllowedTest-case passed');
			             }
			             else
			             {
				             logger.error('isAllowedTest-case failed');
			             }
		             }
	             });
	db.isAllowed(db.memberIsAllowed('nosuch@abc.com'), function() {

	             }, function(err,obj) {
		             if(err) {
			             logger.error('isAllowedTest failed, error: ' + util.inspect(err));
		             }
		             else {
			             if(obj)
			             {
				             logger.info('isAllowedTest-false failed');
			             }
			             else {
				             logger.error('isAllowedTest passed');
			             }
		             }
	             });
}
function getExpensesForUserIdTest(db) {

}
function addEmails(db) {
	var emails = [
		"adolph.nick@gmail.com",
		"alexkapinos10@gmail.com",
		"bjmalecek@gmail.com",
		"buncec87@gmail.com",
		"crisshaikh@gmail.com",
		"dannyclark77@gmail.com",
		"dforseter@gmail.com",
		"dibs1080@yahoo.com",
		"drimon19@gmail.com",
		"eric.shaw9@gmail.com",
		"freshmark7@gmail.com",
		"genebuonaccorsi@gmail.com",
		"goldstej@gmail.com",
		"gstubbs3@gmail.com",
		"jackhatchett@gmail.com",
		"jbabbitt@umass.edu",
		"jcfoster18@gmail.com",
		"jeremynixon@gmail.com",
		"josh.mccarthy1@gmail.com",
		"jqstubbs@gmail.com",
		"jquella@gmail.com",
		"lee.m.farnsworth.12@gmail.com",
		"littlekatz17@gmail.com",
		"manfuel@gmail.com",
		"milesmb@gmail.com",
		"misha.sidorsky@gmail.com",
		"mishaherscu@gmail.com",
		"mjrebholz@gmail.com",
		"morrillperformance@gmail.com",
		"mzalisk@gmail.com",
		"nortonk15@yahoo.com",
		"nwicks@gmail.com",
		"piers.macnaughton@gmail.com",
		"pjprial@gmail.com",
		"r0th71892@gmail.com",
		"robinmeyers10@gmail.com",
		"rowan757@gmail.com",
		"rusty.ingoldsmith@gmail.com",
		"sdz1713@gmail.com",
		"seth.reinhardt@gmail.com",
		"shaun.k.doherty@gmail.com",
		"simmons.alex.r@gmail.com",
		"smart.jamesb@gmail.com",
		"tbrowarjarus@gmail.com",
		"thomas.alexcooper@gmail.com",
		"tsayremccord@gmail.com",
		"ultimasherlock@gmail.com",
		"wallack.russell@gmail.com",
		"wildmanjake@gmail.com",
		"willyneff@gmail.com",
		"xianfoster@gmail.com"

	];
	emails.map(function(email) {
		db.members.insert({email: email});
	};
}