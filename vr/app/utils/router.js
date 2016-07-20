var Grapnel = require('grapnel');
var appAction = require('../actions/app-action');
var appStore = require('../stores/app-store');
var isFirst = true;

var router = new Grapnel({ pushState : true });

router.get('/special', function(req){
    if(isFirst){
        isFirst = false;
        appStore._curDirectory = "special";
        return;
    }
    appAction.onClickMain();
});


router.get('/', function(req){
    if(isFirst){
        appStore._curDirectory = "home";
        isFirst = false;
        return;
    }

    appAction.onClickMain();
});

module.exports = router;