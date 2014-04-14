var express = require('express');
var moment = require('moment');
var console = require('console');
var util = require('util');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {
    var locals={
        title: 'FrogMoneyAdmin',
        time: moment().toISOString(),
        //users:[{name:'test1',id:0},{name:'test2',id:3,other:'other'}]
        loading:true
    }
    req.app.get('db').users.find({},function(err,docs){
        console.log('got response')
        locals.loading=false;
        locals.users=docs;
        res.render('admin', locals);
    })
    //res.render('admin', locals);//TODO figure out how to render the second one like ajax
});
module.exports = router;