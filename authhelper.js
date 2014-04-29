var util = require('util');
var fs = require('fs');
var jsonfile = require('jsonfile');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
var logger=require('log4js').getLogger('fm.authhelper');
var https = require('https');

/*load secret file and oath cache file*/
var files=fs.readdirSync('json');
var secret;
for(var i=0;i<files.length;i++){
    if(files[i].substr(0,14)=='client_secret_'){
        secret=jsonfile.readFileSync('json\\'+files[i]);
        break;
    }
}

function newOAuth2Client()
{
    return new OAuth2Client(secret.web.client_id, secret.web.client_secret, secret.web.redirect_uris[0]);
}
function getUserInfo(tokens,callback)
{
    var oauth2client =newOAuth2Client();
    oauth2client.setCredentials(tokens);
    googleapis.discover('oauth2','v2').execute(function(err,client){
        client.oauth2.userinfo.get().withAuthClient(oauth2client).execute(function(err,obj){
            logger.trace('userinfoobj: '+util.inspect(obj));
            callback(err,obj);
        });
    });
}
function getGroupInfo(groupKey,memberKey,callback)
{
    var path='https://www.googleapis.com/admin/directory/v1/groups/'+groupKey+'/members/'+memberKey;
    https.get(path,function(res){
        callback(null,res);
    }).on('error',function(error){
        callback(error,null);
    });
}
exports.getGroupInfo=getGroupInfo;
exports.newOAuth2Client=newOAuth2Client;
exports.getUserInfo=getUserInfo;
var oauth2Client=newOAuth2Client();
exports.auth_url=oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.email '+
            'https://www.googleapis.com/auth/userinfo.profile '+
            'https://www.googleapis.com/auth/admin.directory.group.readonly'
});