var express = require('express');
var moment = require('moment');
var console = require('console');
var util = require('util');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {

    res.render('test2', {
        navbar:{
            title:req.app.get('title'),
            links:[
                {text:'Users',active:false,href:'#'},
                {text:'Test',active:true,href:'#'},
                {text:'Home',active:false,href:'#'}
            ]
        },
        time: moment().toISOString(),
        auth_url:req.app.get('authhelper').auth_url,
        name:req.cookies.name,
        tokens:req.cookies.tokens
    });

});
module.exports = router;