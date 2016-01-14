var canvasWidth = 620;
var canvasHeight = 540;

module.exports = {
    white: '#ffffff',
    red: '#ff6666',
    yellow: '#f1c30d',
    green: '#33ee33',
    tvScreen: {width: canvasWidth, height: canvasHeight},
    about: {
        "lightColor" : new THREE.Color(0xff3333),
        "color"   : '#ff6666',
        "position": [
            {'left': 250},
            {'left': 200 - canvasWidth},
            {'left': 170 - canvasWidth * 2}
        ],
        'letterSpacing' : 0
    },
    works : {
        "lightColor" : new THREE.Color(0xb7940a),
        "color" : "#f1c30d",
        "position" : [
            {'left': 220},
            {'left': 180 - canvasWidth},
            {'left': 120 - canvasWidth * 2}
        ],
        'letterSpacing' : 0
    },
    sketch : {
        "lightColor" : new THREE.Color(0x33aa33),
        "color" : "#33ee33",
        "position" : [
            {'left': 120},
            {'left': 60 - canvasWidth},
            {'left': 40 - canvasWidth * 2}
        ],
        'letterSpacing' : 0
    },
    contact : {
        "lightColor" : new THREE.Color(0x1111cc),
        "color" : '#8888ff',
        "position" : [
            {'left': 0},
            {'left': -60 - canvasWidth },
            {'left': -120 - canvasWidth * 2 },
        ],
        'letterSpacing' : -5,
    },
    work : {
        "lightColor"       : new THREE.Color(0x333333),
        "heightLightColor" : new THREE.Color(0x999999),
    },
    turnOffColor : new THREE.Color(0xcc1111),
    blackColor   : new THREE.Color(0x333333),
    types : [
        "about",
        "works",
        "sketch"
    ],
    contactPage :{
        type : [
            ['contactMail', 'contactTwitter', 'contactFacebook'],
            ['contactLinkedin', 'contactGithub', 'contactCodepen'],
            ['contactInstgram', 'contactTumblr', 'contactPinterest']
        ]
    },
    sketchPage : {
        type : [
            ['sketchWaterPaint', 'sketchWebGlDojo', 'sketch2DPhy'],
            ['sketchCS', 'contactCodepen', 'sketchGreeting'],
            ['sketchCanvasTest', 'sketchVoronoiBody', null]
        ]
    },
    aboutPage : {
        type : [
            'name',
            'japan',
            'age',
            'job',
            'portrait',
            'live',
            'company',
            'skills',
            'linkedin',
        ]
    },
    controller : {
        "home"   : 0,
        "about"  : Math.PI * 2/6,
        "works"  : Math.PI * 2/6 * 2,
        "work"   : Math.PI * 2/6 * 3,
        "sketch" : Math.PI * 2/6 * 4,
        "contact": Math.PI * 2/6 * 5
    },
    tvPosition : {
        "x" : 76,
        "y" : 77
    },
    delay : {
        firstDelay    : 600,
        intervalDelay : 80
    }
}