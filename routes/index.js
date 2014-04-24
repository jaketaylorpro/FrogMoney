var express = require('express');
var console = require('console');
var util = require('util');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if(req.cookies.tokens)
  {
      req.app.get('authhelper').getUserInfo(req.cookies.tokens,function(err,obj){
        if(err)
        {
            showLogin(req,res);
        }
        else
        {
            console.log('validateTokens: '+util.inspect(obj));
            if(obj.id!=req.cookies.id)
            {
                console.log('accountId mismatch: '+obj.id+'<>'+req.cookies.id);
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

function showLogin(req,res){
    res.render('login', {
        navbar:{
            title:req.app.get('title'),
            links:[
                {text:'Splash',active:true,href:'#',newWindow:false},
                //{text:'GoogleGroup',active:false,href:'https://groups.google.com/forum/#!members/ironside-ultimate-2014',newWindow:true},
                {text:'Contact',active:false,href:'mailto:wildmanjake+frogmoney@gmail.com',newWindow:false}
            ]
        },
        auth_url:req.app.get('authhelper').auth_url,
        auth_refresh:true
    });
}

module.exports = router;
