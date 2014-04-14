var util = require('util');
var console = require('console');
var moment = require('moment');
var async = require('async');
var Datastore= require('nedb');

var db={};
db.users = new Datastore({ filename: 'db/users.db', autoload: true });
db.expenses = new Datastore({ filename: 'db/expenses.db', autoload: true });

async.parallel([
    function(callback) {
        db.users.findOne({},function(err,obj){
            console.log('user results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
            callback(err,obj);
        });
    },
    function(callback) {
        db.expenses.find({},function(err,obj){
            console.log('expenses results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
            callback(err,obj);
        });
    }
],function(err,results){

    console.log('home callback: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(results));
    });