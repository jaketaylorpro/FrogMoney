var express = require('express');
var moment = require('moment');
var console = require('console');
var util = require('util');
var async = require('async');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {
    var locals={
        title: 'FrogMoneyAdmin',
        time: moment().toISOString(),
        loading:true
    };
    async.parallel([
        function(callback) {
            req.app.get('db').users.find({},function(err,docs) {
                callback(err,docs);
            });
        },
        function(callback) {
            req.app.get('db').expenses.find({},function(err,docs) {
                callback(err,docs);
            });
        }
    ],function(err,results)
    {
        if(err)
        {
            console.log('err: '+util.inspect(err));
        }
        console.log('got response')
        locals.loading=false;
        locals.users=results[0];
        locals.expenses=results[1];
        res.render('admin', locals);
    });
    //res.render('admin', locals);//TODO figure out how to render the second one like ajax
});
module.exports = router;