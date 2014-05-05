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
			callback(err, null)
		}
		else {
			callback(null, mongoProjection(obj, {date: 1, event: 1, amount: 1, description: 1}));
		}
	});
};
FmDataMgr.prototype.memberIsAllowed = function(email, allowedCallback, notAllowedCallback) {
	this.db.members.find({email: email}, function(err, obj) {
		if(obj == []) {
			allowedCallback();
		}
		else {
			notAllowedCallback(err);
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