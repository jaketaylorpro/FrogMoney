var logger=require('log4js').getLogger('fm.constants');
exports.title='FrogMoney';
exports.cookieNames=['tokens','id'];
exports.textLoginErrorExpired='Your credentials have expired, please authenticate again.';
exports.textLoginErrorUnknown='There was an error authenticating with google. make sure you have cookies and javascript enabled and try again.';
var defNavbar={
    title:exports.title,
    links:[
        {text:'Expenses',active:false,href:'/expenses'},
        {text:'Payments',active:false,href:'/payments'}
    ],
    homeDisabled:false,
    logoutDisabled:false
};
var loggedOutNavbar={
    title:exports.title,
    links:[
    ],
    homeDisabled:true,
    logoutDisabled:true
};
/**
 * @returns {{title: string, links: Array<{text: string,active: boolean,href: string}>, homeDisabled: boolean, logoutDisabled: boolean}}
 */
function getLoggedOutNavbar(){
    return loggedOutNavbar;
}
exports.getLoggedOutNavbar = getLoggedOutNavbar;


/**
 *
 * @param page string
 * @param homeDisabled boolean
 * @param logoutDisabled boolean
 * @returns {{title: string, links: Array<{text: string,active: boolean,href: string}>, homeDisabled: boolean, logoutDisabled: boolean}}
 */
function getNavbar(page,homeDisabled,logoutDisabled){
    var navbar=JSON.parse(JSON.stringify(defNavbar));
    navbar.page=page;
    logger.trace('building navbar'+JSON.stringify(navbar));
    navbar.links.map(function(link){
        logger.trace('activating: '+JSON.stringify(link));
        logger.trace('text: '+link.text);
        if(link.text.toUpperCase() == navbar.page.toUpperCase()){
            link.active=true;
        }
    });
    if(homeDisabled != null){
        navbar.homeDisabled=homeDisabled;
    }
    if(logoutDisabled != null){
        navbar.logoutDisabled=logoutDisabled;
    }
    return navbar;
};
exports.getNavbar = getNavbar;