var util = require('util');
var moment = require('moment');
var async = require('async');
var Datastore= require('nedb');
var log4js = require('log4js');
var logger = log4js.getLogger('fm.test');

var db={};
db.users = new Datastore({ filename: 'db/users.db', autoload: true });
db.expenses = new Datastore({ filename: 'db/expenses.db', autoload: true });

async.parallel([
    function(callback) {
        db.users.findOne({},function(err,obj){
            logger.info('user results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
            callback(err,obj);
        });
    },
    function(callback) {
        db.expenses.find({},function(err,obj){
            logger.info('expenses results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
            callback(err,obj);
        });
    }
],function(err,results){

    logger.info('home callback: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(results));
    });