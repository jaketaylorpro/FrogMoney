var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var test1 = require('./routes/test1');
var test2 = require('./routes/test2');
var oauth2callback = require('./routes/oauth2callback');
var admin = require('./routes/admin');
var home = require('./routes/home');
var logout = require('./routes/logout');
var expenses = require('./routes/expenses');
var log4js = require('log4js');
var logger = log4js.getLogger('fm.app');
var util = require('util');
var constants = require('./fmconstants');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/test1', test1);
app.use('/expenses', expenses);
app.use('/test2', test2);
app.use('/oauth2callback', oauth2callback);
app.use('/admin', admin);
app.use('/home', home);
app.use('/logout', logout);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handler
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	logger.error('top level error', util.inspect(err));
	res.render('error', {
		message: (err.message ? err.message : err),
		error: (app.get('env') === 'development' ? err : {}),
		navbar: {title: constants.title}
	});
	next(err);
});


module.exports = app;
