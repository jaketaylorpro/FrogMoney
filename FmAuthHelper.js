var util = require('util');
var fs = require('fs');
var jsonfile = require('jsonfile');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
var logger = require('log4js').getLogger('fm.authhelper');
var https = require('https');
var path = require('path');
var domain = require('domain');
var constants = require('./fmconstants');

function FmAuthHelper(dataMgr,fake) {
	this.fake = fake;
	this.dataMgr = dataMgr;
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


FmAuthHelper.prototype.logout = function(req,res,redirect) {
	logger.trace('logout called');
	for(var i in constants.cookieNames) {
		logger.trace('deleting cookie: ' + constants.cookieNames[i]);
		res.clearCookie(constants.cookieNames[i]);
	}
	res.redirect(redirect);
};
FmAuthHelper.prototype.newOAuth2Client = function() {
	logger.warn('new oauth client: '+this.fake)
	if(this.fake){
		return {
			getToken:function(code, callback){callback(null,{});},
			generateAuthUrl:function(){return 'http://localhost:3000/oauth2callback';}
		};
	}
	return new OAuth2Client(this.secret.web.client_id, this.secret.web.client_secret, this.secret.web.redirect_uris[0]);
};
FmAuthHelper.prototype.getUserInfo = function(tokens, callback) {
	if(this.fake){
		callback(null,{"id":"9999999999999","email":"test@gmail.com","verified_email":true,"name":"Jamie Arambula","given_name":"Jamie","family_name":"Arambula","link":"https://plus.google.com/9999999999999","picture":"https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg","gender":"male","locale":"en"});
	}
	else{
		var oauth2client = this.newOAuth2Client();
		oauth2client.setCredentials(tokens);
		googleapis.discover('oauth2', 'v2').execute(function(err, client) {
			client.oauth2.userinfo.get().withAuthClient(oauth2client).execute(function(err, obj) {
				logger.trace('userinfoobj: ' + util.inspect(obj));
				callback(err, obj);
			});
		});
	}
};
FmAuthHelper.prototype.verifyAuthentication = function(tokens, callback) {
	if(this.fake) {
		callback(null, true);
	}
	else {
		var client_id = this.secret.client_id
		var oauth2client = this.newOAuth2Client();
		oauth2client.setCredentials(tokens);
		logger.trace('verifying tokens: ' + util.inspect(tokens));
		var dataMgr = this.dataMgr;
		var d = domain.create();
		//d.add(tokens);//need to add this here in order to reference it in function()
		//d.add(dataMgr);
		//d.add(oauth2client);
		//d.add(logger);
		//d.add(client_id);
		var errHandler = function(err) {
			logger.warn('err: ' + util.inspect(err));
			if(err.contains('Error: Token used too late')) {
				callback('verificationFailedExpired', null);
			}
			else {
				callback(err, null);
			}
			return;
		};
		d.on('error', errHandler);//this doesn't seem to work
		//d.on('uncaughtException',errHandler);//this doesn't seem to work
		d.run(function() {
			try {
				oauth2client.verifyIdToken(tokens.id_token, client_id, function(err, obj) {
					if(err) {
						logger.warn('error verifying token: ' + tokens.id_token);
						callback(err, null);
						return;
					}
					else {
						logger.trace('verified: ' + tokens.id_token);
						//obj has a getEnvelope and getPayload method
						var payload = obj.getPayload();
						logger.trace('payload: ' + util.inspect(payload));
						dataMgr.memberIsAllowed(payload, callback);
					}
				});
			}
			catch(err) {
				logger.warn('error verifying token: ' + tokens.id_token + '; ' + util.inspect(err));
				callback(err, null);
				return;
			}

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
}
FmAuthHelper.prototype.verifyAndHandleAuthentication = function(tokens,req,res,callback) {
	if(this.fake){
		callback(null,{payload:{id:''}});
	}
	else {
		var logout = this.logout;
		this.verifyAuthentication(tokens, function(err, obj) {
			if(err) {
				logger.trace('authenticationFailed: ' + err);
				logout(req, res, '/?warning=verificationFailed');
				//callback(err,null);
			}
			else if(!obj.allowed) {
				logger.trace('authenticationFailed: email not allowed');
				logout(req, res, '/?warning=notAllowed');
				//callback('not allowed',null);
			}
			else {

				logger.trace('authentication succeded');
				callback(null, obj);
			}
		});
	}
};
module.exports = FmAuthHelper;
