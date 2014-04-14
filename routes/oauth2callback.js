var express = require('express');
var moment = require('moment');
var console = require('console');
var util = require('util');
var googleapis = require('googleapis');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res) {
    var code = req.query.code;
    console.log('GOT CODE!'+ code);
    var oauth2Client=req.app.get('authhelper').newOAuth2Client();
    oauth2Client.getToken(code, function(err, tokens){
        var locals = {
            code: code,
            tokens: tokens
        };
        if(err)
        {
            console.log('err');
            console.log(err);
            locals.username="err";
            res.render('home.jade', locals);
        }
        else
        {
            console.log('GOT TOKENS!' + util.inspect(tokens));
            req.app.get('authhelper').getUserInfo(tokens,function(err,obj){
                if(err)
                {
                    console.log('err: '+util.inspect(err));
                    res.redirect('/');
                }
                else
                {
                    res.cookie('displayName',obj.displayName);
                    res.cookie('tokens',tokens);
                    res.cookie('id',obj.id);
                    req.app.get('db').users.update({id:obj.id},obj,{upsert:true},function(err,obj){
                        if(err)
                        {
                            console.log("writedberr: "+util.inspect(err));
                        }
                        else
                        {
                            res.redirect('../home');
                        }
                    });

                }
            });
            /*oauth2Client.setCredentials(tokens);
            googleapis.discover('plus','v1').execute(function(err,client){
                if(err)
                {
                    console.log("execute err");
                    console.log(err);
                    res.render('home.jade', locals);
                }
                else
                {
                    client.plus.people.get({userId:'me'}).withAuthClient(oauth2Client).execute(function(err,obj){
                        if(err)
                        {
                            console.log('err: '+util.inspect(err));
                            locals.username="unknown";
                        }
                        console.log('obj: '+util.inspect(obj));
                        req.app.get('db').users.update({id:obj.id},obj,{upsert:true});

                        locals.username=obj.displayName;
                        res.cookie('displayName',obj.displayName);
                        res.cookie('tokens',tokens);
                        res.cookie('id',obj.id);
                        res.redirect('../home');
                    });
                    //console.log('decoded: '+authhelper.oauth2Client.decodeBase64(tokens.id_token));
                }

            });*/
        }
    });
});
module.exports = router;


/*
 "C:\Program Files (x86)\JetBrains\WebStorm 8.0.1\bin\runnerw.exe" "C:\Program Files\nodejs\node.exe" www
 read secret: { web:
 { auth_uri: 'https://accounts.google.com/o/oauth2/auth',
 client_secret: 'X_5VCEeO3Z4_CTKvqLpmv8rY',
 token_uri: 'https://accounts.google.com/o/oauth2/token',
 client_email: '30662632074-cml8ab025jtcatdm3fsu6k3d7qbtav2n@developer.gserviceaccount.com',
 redirect_uris: [ 'http://localhost:3000/oauth2callback' ],
 client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/30662632074-cml8ab025jtcatdm3fsu6k3d7qbtav2n@developer.gserviceaccount.com',
 client_id: '30662632074-cml8ab025jtcatdm3fsu6k3d7qbtav2n.apps.googleusercontent.com',
 auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
 javascript_origins: [ 'http://localhost' ] } }
 authhelper: https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&response_type=code&client_id=30662632074-cml8ab025jtcatdm3fsu6k3d7qbtav2n.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2callback
 GET /test1 200 251ms - 813b
 GET /stylesheets/style.css 200 58ms - 110b
 GET /test1/ 200 12ms - 813b
 GET /stylesheets/style.css 200 6ms - 110b
 GOT CODE!4/yEjfzLAVP2V2fYt732a0c6WgDBlu.guplw1ZpEoMc3oEBd8DOtNBF3CmpigI
 GOT TOKENS!{ access_token: 'ya29.1.AADtN_Ue5eRkzTVAzlse4XZkXXkAAgKb8w55inSbgg1vVig4WSpUPRe26fvEsmI',
 token_type: 'Bearer',
 expires_in: 3599,
 id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY0ZTY4MmM5OGNhNmU1Mzg2MDFmNWZjY2ZhMTQwYTAyOWJlNDM0NzYifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWQiOiIxMDk5MDg5NzQ5NTkxMzAyNDQwNTAiLCJzdWIiOiIxMDk5MDg5NzQ5NTkxMzAyNDQwNTAiLCJhenAiOiIzMDY2MjYzMjA3NC1jbWw4YWIwMjVqdGNhdGRtM2ZzdTZrM2Q3cWJ0YXYybi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoiamFjb2J0LmJyYW5kZWlzQGdtYWlsLmNvbSIsImF0X2hhc2giOiI3N3BWRVhBS3dBMFNUblR1MmJicVVnIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6IjMwNjYyNjMyMDc0LWNtbDhhYjAyNWp0Y2F0ZG0zZnN1NmszZDdxYnRhdjJuLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwidG9rZW5faGFzaCI6Ijc3cFZFWEFLd0EwU1RuVHUyYmJxVWciLCJ2ZXJpZmllZF9lbWFpbCI6dHJ1ZSwiY2lkIjoiMzA2NjI2MzIwNzQtY21sOGFiMDI1anRjYXRkbTNmc3U2azNkN3FidGF2Mm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJpYXQiOjEzOTcyODI5OTgsImV4cCI6MTM5NzI4Njg5OH0.NPWdTZaiWoj-N4BtOdLEcduam0GY2gMANCzACTFAfCXBOgz_ve574718OSVYxPZHAJtG3ET3TUD4X9jrp2vQsQX_XKNCP0WfTJcYNzkJFmg6rEx2uCDiAZu4Rv_nip3vXW_7xDTzPg1VYZuUM_7zzJr2Eg9k60Z9J3fIpSiDANI' }
 GET /oauth2callback?code=4/yEjfzLAVP2V2fYt732a0c6WgDBlu.guplw1ZpEoMc3oEBd8DOtNBF3CmpigI 200 586ms - 192b
 GET /stylesheets/style.css 304 3ms
 err: { errors:
 [ { domain: 'usageLimits',
 reason: 'accessNotConfigured',
 message: 'Access Not Configured. Please use Google Developers Console to activate the API for your project.' } ],
 code: 403,
 message: 'Access Not Configured. Please use Google Developers Console to activate the API for your project.' }
 obj: null
 */