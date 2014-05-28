var express = require('express');
var constants = require('../fmconstants');
var router = express.Router();
var log4js = require('log4js');
var logger = log4js.getLogger('fm.logout');
/* GET home page. */
router.get('/', function(req, res) {
	req.app.get('authhelper').logout(req,res,'/');
});

module.exports = router;
