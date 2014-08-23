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
	this.db.groups = new Datastore({ filename: dir + '/groups.db', autoload: true });
	logger.trace('created data manager with databases');
}
FmDataMgr.prototype.getUserById = function(id,callback) {
	this.db.users.findOne({id:id},callback);
};
FmDataMgr.prototype.getExpensesForUserId = function(id, callback) {
	var dis = this;
	this.db.expenses.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, dis.__mongo_projection(obj, {date: 1, event: 1, amount: 1, description: 1}));
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
				callback(null, dis.__mongo_projection(results, {date: 1, event: 1, amount: 1, description: 1}));
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
	var dis=this;
	this.db.payments.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, dis.__mongo_projection(obj, {date: 1, dues: 1, amount: 1, method: 1,confirm: 1}));
		}
	});
}
FmDataMgr.prototype.getTransfersForUserId = function(id, callback) {
	var dis=this;
	this.db.transfers.find({id: id}).sort({event: 1}).exec(function(err, obj) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, dis.__mongo_projection(obj, {date: 1, event: 1, amount: 1, description: 1}));
		}
	});
};
FmDataMgr.prototype.getDues = function(callback) {
	var dis=this;
	this.db.dues.find().exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else {
			callback(null, dis.__mongo_projection(obj,{name:1,date:1,amount:1}));
		}
	});
}
FmDataMgr.prototype.getCurrentEvent = function(callback) {
	var dis=this;
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	this.db.events.find({date_end:{"$gte":yesterday}}).sort({date_start:1}).limit(1).exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else{
			events=dis.__mongo_projection(obj,{date_start:1,date_end:1,name:1,description:1});
			callback(null,events.length>0?events[0]:{});
		}
	});
}
FmDataMgr.prototype.getAllEvents = function(projection,callback) {
	var dis=this;
	this.db.events.find().exec(function(err,obj){
		if(err) {
			callback(err,null);
		}
		else{
			events=dis.__mongo_projection(obj,projection||{date_start:1,date_end:1,name:1,description:1});
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
FmDataMgr.prototype.getAllGroups = function(callback) {
	this.db.groups.find({},function(err,obj){
		if(err)
		{
			logger.warn('error getting groups: '+err);
		}
		else
		{
			logger.info('found groups: '+util.inspect(obj));
			callback(null,obj);
		}
	} );
};
FmDataMgr.prototype.addGroup = function(groupObj,callback) {
	var groupsDb=this.db.groups;
	if(groupObj.name == null)
	{
		logger.warn('group has no name: '+util.inspect(groupObj));
		callback('group must have a name');
	}
	else {
		this.db.groups.find({name:new RegExp(groupObj.name,"i")},function(err,obj){
			if(err){
				logger.warn('error searching groups by name'+ err);
				callback(err,null);
			}
			else
			{
				logger.info('dupe search returned: "'+util.inspect(obj)+'"');
				if(obj&&obj.length!=0)
				{
					errMsg='name '+groupObj.name+' is not unique, so we can\'t add it';
					logger.warn(errMsg);
					callback(errMsg,null)
				}
				else
				{
					logger.info('name is unique, so we will add it');
					groupsDb.insert(groupObj,callback);
				}
			}
		});
	}
};
FmDataMgr.prototype.editGroup = function(groupObj,callback) {
	this.db.groups.update({_id:groupObj._id},groupObj,callback);
}
FmDataMgr.prototype.__mongo_projection=function(collection, projection) {
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