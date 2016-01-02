var canvasWidth = 620;
var canvasHeight = 540;

module.exports = {
    white: '#ffffff',
    red: '#ff6666',
    yellow: '#dddd33',
    green: '#33ee33',
    tvScreen: {width: canvasWidth, height: canvasHeight},
    about: {
        "lightColor" : new THREE.Color(0xff3333),
        "color"   : '#ff6666',
        "position": [
            {'left': 250},
            {'left': 200 - canvasWidth},
            {'left': 170 - canvasWidth * 2}
        ]
    },
    works : {
        "lightColor" : new THREE.Color(0xaaaa33),
        "color" : "#dddd33",
        "position" : [
            {'left': 220},
            {'left': 180 - canvasWidth},
            {'left': 120 - canvasWidth * 2}
        ]
    },
    sketch : {
        "lightColor" : new THREE.Color(0x33aa33),
        "color" : "#33ee33",
        "position" : [
            {'left': 120},
            {'left': 60 - canvasWidth},
            {'left': 40 - canvasWidth * 2}
        ]
    },
    types : [
        "about",
        "works",
        "sketch"
    ],
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
    tvPosition : {
        "x" : 76,
        "y" : 77
    },
    delay : {
        firstDelay    : 600,
        intervalDelay : 80
    }
}