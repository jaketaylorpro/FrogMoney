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
            res.render('login', {
                navbar:{
                    title:req.app.get('title'),
                    links:[
                        {text:'Users',active:false,href:'#'},
                        {text:'Test',active:true,href:'#'},
                        {text:'Home',active:false,href:'#'}
                    ]
                },
                auth_url:req.app.get('authhelper').auth_url,
                auth_refresh:true
            });
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
      res.render('login',{
              navbar:{
                  title:req.app.get('title'),
                  links:[
                      {text:'Users',active:false,href:'#'},
                      {text:'Test',active:true,href:'#'},
                      {text:'Home',active:false,href:'#'}
                  ]
              },
          auth_url:req.app.get('authhelper').auth_url
      });
  }
});

module.exports = router;
