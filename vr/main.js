/** global library **/
require('gsap');

window.THREE = require('three');

window.WEBVR = require('./vendors/webvr/WebVR');


require('./vendors/webvr/effects/VREffect');
require('./vendors/webvr/controls/VRControls');

require('./app/app');
