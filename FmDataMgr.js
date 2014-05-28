var util = require('util');
var Datastore = require('nedb');
var logger = require('log4js').getLogger('fm.FmDataMgr');

function FmDataMgr(dir) {
	this.db = {};
	this.db.users = new Datastore({ filename: dir + '/users.db', autoload: true });
	this.db.expenses = new Datastore({ filename: dir + '/expenses.db', autoload: true });
	this.db.members = new Datastore({ filename: dir + '/members.db', autoload: true });
	this.db.events = new Datastore({ filename: dir + '/events.db', autoload: true });
	this.db.transfers = new Datastore({ filename: dir + '/transfers.db', autoload: true });
	logger.trace('created data manager with databases');
}
FmDataMgr.prototype.getUserById = function(id,callback) {
	this.db.users.findOne({id:id},callback);
};
FmDataMgr.prototype.getExpensesForUserId = function(id, callback) {
	this.db.expenses.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, mongoProjection(obj, {date: 1, event: 1, amount: 1, description: 1}));
		}
	});
};
FmDataMgr.prototype.getPaymentsForUserId = function(id, callback) {
	if(this.db.payments) {
		this.db.payments.find({id: id}).sort({event: 1}).exec(function(err, obj) {
			if(err) {
				callback(err, null);
			}
			else {
				callback(null, mongoProjection(obj, {date: 1, event: 1, amount: 1, description: 1,dueId: 1}));
			}
		});
	}
	else {
		callback(null, []);
	}
}
FmDataMgr.prototype.getTransfersForUserId = function(id, callback) {
	if(this.db.transfers){
		this.db.transfers.find({id: id}).sort({event: 1}).exec(function(err, obj) {
			if(err) {
				callback(err, null);
			}
			else {
				callback(null, mongoProjection(obj, {date: 1, event: 1, amount: 1, description: 1}));
			}
		});
	}
	else{
		callback(null,[]);
	}
};
FmDataMgr.prototype.getDues = function(callback) {
	if(this.db.dues){
		this.db.dues.find().exec(function(err,obj){
			if(err) {
				callback(err,null);
			}
			else {
				callback(null, mongoProjection(obj,{name:1,date:1,amount:1}));
			}
		});
	}
	else{
		callback(null,{date: '2014-07-01',name: 'test dues',amount:100.00})
	}
}
FmDataMgr.prototype.getCurrentEvent = function(callback) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	if(this.db.events){
		this.db.events.find({date_end:{"$gte":yesterday}}).sort({date_start:1}).limit(1).exec(function(err,obj){
			if(err) {
				callback(err,null);
			}
			else{
				callback(null,mongoProjection(obj,{date_start:1,date_end:1,name:1,description:1}));
			}
		});
	}
	else{
		callback(null,{date_start: new Date(2014,07,01),date_end:new Date(2014,07,04),name:'usopen',description:'the first tournamet of the year'});
	}
}
FmDataMgr.prototype.memberIsAllowed = function(payload, callback) {
	this.db.members.find({email: payload.email}, function(err, obj) {
		if(err)
		{
			logger.warn('error finding member: '+err);
			callback(err,null);
		}
		else{
			logger.info('found member: '+util.inspect(obj));
			if(obj.length>0) { //not found returns empty array []
				logger.trace('sending found');
				callback(null,{allowed:true,payload:payload,member:obj[0]});
			}
			else {
				logger.trace('sending not found');
				callback(null,{allowed:false,payload:payload,member:obj[0]});
			}
		}
	});
};
function mongoProjection(collection, projection) {
	logger.trace('collection: ' + util.inspect(collection));
	logger.trace('projection: ' + util.inspect(projection));
	var ret = [];
	for(var i = 0; i < collection.length; i++) {
		var o = collection[i];
		console.log("o: " + util.inspect(o));
		var d = {};
		for(key in projection) {
			logger.trace("setting: " + key + " to " + o[key] + " for " + util.inspect(d) + " from " + util.inspect(o));
			d[key] = o[key];
		}
		ret.push(d);
	}
	return ret;
}

module.exports = FmDataMgr;