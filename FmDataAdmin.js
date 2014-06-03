var util = require('util');
var Datastore = require('nedb');
var logger = require('log4js').getLogger('fm.FmDataMgr');

function FmDataAdmin(dir) {
	var dataMgr=new FmDataMgr(dir);
	this.db = dataMgr.db;
}
function addEvent(dataAdmin)
{
	var usopen={
		date_start: new Date(2014,07,01),
		date_end:new Date(2014,07,04),
		name:'usopen',
		description:'the first tournamet of the year'
	};
	if(!dataAdmin.db.events.find({name:usopen.name})){
		dataAdmin.db.events.insert(usopen);
	}
}
function addDue(dataAdmin)
{
	var dues1={date: '2014-07-01',name: 'test dues',amount:100.00};
	if(!dataAdmin.db.dues.find({name: dues1.name})){
		dataAdmin.db.dues.insert(dues1);
	}
}

var dataAdmin=new FmDataAdmin('db')
/addEvent(dataAdmin);
addDue(dataAdmin);
