var express = require('express');
var moment = require('moment');
var console = require('console');
var util = require('util');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {

    res.render('test1', {
        title: 'FrogMoney',
        time: moment().toISOString(),
        auth_url:req.app.get('authhelper').auth_url,
        name:req.cookies.name,
        tokens:req.cookies.tokens
    });

});
/*POST OAuth*/
router.post('/test1_submit',function(req,res){
    console.log('post called: ');
    //console.log(util.inspect(req,{depth:null}));
    console.log(req.body);
    var user=req.body.user;
    res.send('attempting to log in: '+user+';'+req.app.get('testprop'));

});
module.exports = router;