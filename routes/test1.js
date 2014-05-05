var express = require('express');
var constants = require('../fmconstants');
var router = express.Router();
var navbar = {
	title: constants.title,
	links: [
		{text: 'Home', active: false, href: '/', newWindow: false},
		{text: 'Error', active: true, href: '#', newWindow: false},
		{text: 'Contact', active: false, href: 'mailto:wildmanjake+frogmoney@gmail.com', newWindow: false}
	]
};
/* GET users listing. */
router.get('/', function(req, res) {
	throw new Error('err bla');
	var x = req.foo.bar;
	req.render('test1');
});
module.exports = router;