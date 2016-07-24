/** global library **/
require('gsap');

window.THREE = require('three');

window.WEBVR = require('./vendors/webvr/WebVR');


require('./vendors/webvr/effects/VREffect');
require('./vendors/webvr/controls/VRControls');

if ( WEBVR.isLatestAvailable() === false ) {
    document.body.appendChild( WEBVR.getMessage() );
}

require('./app/app');

//TODO the box movement is like spring when you click the controller.