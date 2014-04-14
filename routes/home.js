var express = require('express');
var console = require('console');
var moment = require('moment');
var util = require('util');
var async = require('async');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {
    async.parallel([
        function(callback) {
            req.app.get('db').users.findOne({id:req.cookies.id},function(err,obj){
                console.log('user results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
                callback(err,obj);
            });
        },
        function(callback) {
            req.app.get('db').expenses.find({id:req.cookies.id},function(err,obj){
                console.log('expenses results: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(obj));
                callback(err,obj);
            });
        }
    ],function(err,results){

        console.log('home callback: '+moment().toISOString()+': '+util.inspect(err)+','+util.inspect(results));
        res.render('home', {
            title: req.app.get('title'),
            user:results[0],
            expenses:results[1]
        });
    });
});

/*POST OAuth*/
router.post('/insert_expense',function(req,res){
    console.log('post called: ');
    //console.log(util.inspect(req,{depth:null}));
    console.log(req.body);
    req.app.get('db').expenses.insert(req.body,function(err,obj){
        if(err)
        {
            console.log("err: "+util.inspect(err));
        }
        else
        {
            console.log("insert response: "+util.inspect(obj));
        }
        res.redirect('/home');
    });
});
module.exports = router;