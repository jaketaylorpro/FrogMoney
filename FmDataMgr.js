var util = require('util');
var async = require('async');
var Datastore = require('nedb');
var logger = require('log4js').getLogger('fm.FmDataMgr');

function FmDataMgr(dir) {
	this.db = {};
	this.db.users = new Datastore({ filename: dir + '/users.db', autoload: true });
	this.db.expenses = new Datastore({ filename: dir + '/expenses.db', autoload: true });
	this.db.payments = new Datastore({ filename: dir + '/payments.db', autoload: true });
	this.db.members = new Datastore({ filename: dir + '/members.db', autoload: true });
	this.db.events = new Datastore({ filename: dir + '/events.db', autoload: true });
	this.db.transfers = new Datastore({ filename: dir + '/transfers.db', autoload: true });
	this.db.dues = new Datastore({ filename: dir + '/dues.db', autoload: true });
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
FmDataMgr.prototype.getExpensesForEvent = function(event, callback) {
	var dis = this;
	this.db.expenses.find({event: event}).sort({date: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			var asyncCalls=[]
			obj.map(function(o){
				logger.info("event found, player_id: "+util.inspect(o));

				asyncCalls.push(function(callbackAsync){
					dis.getUserById(o.id,function(err,player) {
						logger.info("player found: "+util.inspect(player));
						if(err) {
							callback(err);
						}
						else
						{
							if(player) {
								o.player_name=player.name;
							}
							callbackAsync(null,o);
						}
					});
				});
			});
			async.parallel(asyncCalls,function(err,results){
				logger.info('got async expense player lookup results: '+util.inspect(results));
				callback(null, mongoProjection(results, {date: 1, event: 1, amount: 1, description: 1}));
			});
		}
	});
};
FmDataMgr.prototype.getExpensesForCurrentEvent = function(callback) {
	var dis = this;
	this.getCurrentEvent(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else
		{
			dis.getExpensesForEvent(obj.name,callback);
		}
	});
}

FmDataMgr.prototype.getPaymentsForUserId = function(id, callback) {
	this.db.payments.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, mongoProjection(obj, {date: 1, dues: 1, amount: 1, method: 1,confirm: 1}));
		}
	});
}
FmDataMgr.prototype.getTransfersForUserId = function(id, callback) {
	this.db.transfers.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, mongoProjection(obj, {date: 1, event: 1, amount: 1, description: 1}));
		}
	});
};
FmDataMgr.prototype.getDues = function(callback) {
	this.db.dues.find().exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else {
			callback(null, mongoProjection(obj,{name:1,date:1,amount:1}));
		}
	});
}
FmDataMgr.prototype.getCurrentEvent = function(callback) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	this.db.events.find({date_end:{"$gte":yesterday}}).sort({date_start:1}).limit(1).exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else{
			events=mongoProjection(obj,{date_start:1,date_end:1,name:1,description:1});
			callback(null,events.length>0?events[0]:{});
		}
	});
}
FmDataMgr.prototype.getAllEvents = function(projection,callback) {
	this.db.events.find().exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else{
			events=mongoProjection(obj,projection||{date_start:1,date_end:1,name:1,description:1});
			callback(null,events);
		}
	});
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
			if(projection[key]=='.') {
				d=o[key];
				break;
			}
			else {
				logger.trace("setting: " + key + " to " + o[key] + " for " + util.inspect(d) + " from " + util.inspect(o));
				d[key] = o[key];
			}

		}
		ret.push(d);
	}
	return ret;
}

module.exports = FmDataMgr;