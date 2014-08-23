var util = require('util');
var Datastore = require('nedb');
var logger = require('log4js').getLogger('fm.FmDataMgr');
var FmDataMgr = require('./FmDataMgr.js');

function FmDataAdmin(dir) {
	var dataMgr=new FmDataMgr(dir);
	this.db = dataMgr.db;
	this.dataMgr=dataMgr;
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
function addEveryoneGroup(dataAdmin)
{
	dataAdmin.db.members.find({},function(err,obj){
		dataAdmin.dataMgr.addGroup(
			{owner_id:'100603670659836830855',name:'everyone',members:dataAdmin.dataMgr.__mongo_projection(obj,{email:'.'})},
			function(err,obj){
				logger.info(err);
				logger.info(obj);
		});
	})
}
function addNewGroup(dataAdmin,name,members)
{
	dataAdmin.dataMgr.addGroup(
		{owner_id:'100603670659836830855',name:name,members:members},
		function(err,obj){
			logger.info(err);
			logger.info(obj);
		});
}

var dataAdmin=new FmDataAdmin('db')
//addEvent(dataAdmin);
//addDue(dataAdmin);
//addEveryoneGroup(dataAdmin);
addNewGroup(dataAdmin,'frogGroup',['wildmanjake@gmail.com']);
