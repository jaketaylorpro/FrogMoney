var express = require('express');
var logger=require('log4js').getLogger('fm.test');
var util = require('util');
var moment = require('moment');
var constants = require('../fmconstants');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {

    req.app.get('authhelper').getGroupInfo(constants.googleGroupKey,req.cookies.id,function(err,obj){
        logger.info(util.inspect(err));
        logger.info(util.inspect(obj));
        res.render('test2', {
            navbar:constants.getNavbar('test2'),
            time: moment().toISOString(),
            auth_url:req.app.get('authhelper').auth_url,
            name:req.cookies.name,
            tokens:req.cookies.tokens,
            data:util.inspect(obj)
        });
    });


});
module.exports = router;