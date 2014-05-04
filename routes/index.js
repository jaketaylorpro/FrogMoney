var express = require('express');
var constants = require('../fmconstants');
var util = require('util');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  if(req.query.warning)
  {
      showLogin(req,res,req.query.warning);
  }
  else if(req.cookies.tokens)
  {
      req.app.get('authhelper').getUserInfo(req.cookies.tokens,function(err,obj){
        if(err)
        {
            showLogin(req,res,constants.loginErrorWarning);
        }
        else
        {
            logger.trace('validateTokens: '+util.inspect(obj));
            if(obj.id!=req.cookies.id)
            {
                logger.trace('accountId mismatch: '+obj.id+'<>'+req.cookies.id);
            }
            res.redirect('home');
        }
      });
  }
  else
  {
      showLogin(req,res);
  }
});

function showLogin(req,res,warning){
    res.render('login', {
        navbar: constants.getLoggedOutNavbar(),
        auth_url:req.app.get('authhelper').auth_url,
        warning:warning
    });
}

module.exports = router;
