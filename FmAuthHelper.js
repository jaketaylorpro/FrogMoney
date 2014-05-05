var util = require('util');
var fs = require('fs');
var jsonfile = require('jsonfile');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
var logger = require('log4js').getLogger('fm.authhelper');
var https = require('https');
var path = require('path');
var domain = require('domain');

function FmAuthHelper(dataMgr) {
	this.dataMgr = dataMgr
	/*load secret file*/
	var files = fs.readdirSync('json');
	for(var i = 0; i < files.length; i++) {
		if(files[i].substr(0, 14) == 'client_secret_') {
			this.secret = jsonfile.readFileSync('json' + path.sep + files[i]);
			break;
		}
	}
	/*generate auth_url*/
	var oauth2Client = this.newOAuth2Client();
	this.auth_url = oauth2Client.generateAuthUrl({
		                                             access_type: 'online'/*'offline'*/,
		                                             scope: 'https://www.googleapis.com/auth/userinfo.email ' +
		                                                    'https://www.googleapis.com/auth/userinfo.profile '/*+
		 'https://www.googleapis.com/auth/admin.directory.group.readonly'*/
	                                             });
}


FmAuthHelper.prototype.newOAuth2Client = function() {
	return new OAuth2Client(this.secret.web.client_id, this.secret.web.client_secret, this.secret.web.redirect_uris[0]);
};
FmAuthHelper.prototype.getUserInfo = function(tokens, callback) {
	var oauth2client = this.newOAuth2Client();
	oauth2client.setCredentials(tokens);
	googleapis.discover('oauth2', 'v2').execute(function(err, client) {
		client.oauth2.userinfo.get().withAuthClient(oauth2client).execute(function(err, obj) {
			logger.trace('userinfoobj: ' + util.inspect(obj));
			callback(err, obj);
		});
	});
};
FmAuthHelper.prototype.verifyAuthentication = function(tokens, callback) {
	var client_id=this.secret.client_id
	var oauth2client = this.newOAuth2Client();
	oauth2client.setCredentials(tokens);
	logger.trace('verifying tokens: '+util.inspect(tokens));
	var d = domain.create();
	d.on('error',function(err) {
		logger.warn('err: '+util.inspect(err));
		if(err.contains('Error: Token used too late')) {
			callback('verificationFailedExpired',null);
		}
		else {
			callback(err,null);
		}
	});
	d.run(function() {
		oauth2client.verifyIdToken(tokens.id_token,client_id,function(err,obj){
			if(err) {
				logger.warn('error verifying token: '+id_token);
				callback(err,null);
				return
			}
			else {
				logger.trace('verified: '+id_token);
				callback(null,true);
			}
		});
	});
	/*
	oauth2client.
	googleapis.discover('oauth2', 'v2').execute(function(err, client) {
		client.oauth2.userinfo.get().withAuthClient(oauth2client).execute(function(err, obj) {
			if(err) {
				logger.warn('there was an error getting userinfo from the googleapis: ' + err);
				notAllowedCallback(err);
			}
			logger.trace('userinfoobj: ' + util.inspect(obj));
			if(obj.id != id) {
				notAllowedCallback('cookie ID did not match oauth ID')
			}
			else {
				this.dataMgr.memberIsAllowed(obj.email, allowedCallback, function(err) {
					if(err) {
						logger.warn('there was an error checking if user: ' + obj.email + ' is allowed: ' + err);
						notAllowedCallback(err);
					}
					else {
						var message = 'user: ' + obj.email + ' is not allowed';
						logger.info(message);
						notAllowedCallback(message);
					}
				})
			}
		});
	});
	*/
}
module.exports = FmAuthHelper;
