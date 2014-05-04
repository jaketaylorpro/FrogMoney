var express = require('express');
var util = require('util');
var async = require('async');
var router = express.Router();
var logger = require('log4js').getLogger('fm.expenses');
var constants = require('../fmconstants');
var expensesHeader={date:1,event:1,amount:1,description:1};
/* GET expenses listing. */
router.get('/', function(req, res) {
    async.parallel([
        function(callback) {
            req.app.get('db').users.findOne({id:req.cookies.id},function(err,obj){
                logger.trace('user results: '+util.inspect(err)+','+util.inspect(obj));
                callback(err,obj);
            });
        },
        function(callback) {
            req.app.get('db').getExpensesForUserId(req.cookies.id,function(err,obj){
                logger.trace('expenses results: '+util.inspect(err)+','+util.inspect(obj));
                callback(err,obj);
            });
        },
        function(callback) {

        }

    ],function(err,results){

        logger.trace('expenses callback: '+util.inspect(err)+','+util.inspect(results));
        res.render('expenses', {
            navbar: constants.getNavbar('expenses'),
            user:results[0],
            expensesHeader:expensesHeader,
            expensesData:results[1]
        });
    });
});

/*POST OAuth*/
router.post('/insert_expense',function(req,res){
    logger.trace('post called: ');
    //logger.trace(util.inspect(req,{depth:null}));
    logger.trace(req.body);
    //req.app.get('db').insertExpense()
    req.app.get('db').expenses.insert(req.body,function(err,obj){
        if(err)
        {
            throw err;
        }
        else
        {
            logger.trace("insert response: "+util.inspect(obj));
        }
        res.redirect('/home');
    });
});
module.exports = router;
