var appAction = require('../actions/app-action');
var appStore  = require('../stores/app-store');

var worldScaled = 1 / 100;
var originVertice = new THREE.Vector3(0, 0, 0);
var originDirection = new THREE.Vector3(0, 0.00, -5 * worldScaled);

function descSort( a, b ) {

    return a.distance - b.distance;

}

function intersectObject( object, raycaster, intersects, recursive ) {

    if ( object.visible === false ) return;

    object.raycast( raycaster, intersects );

    if ( recursive === true ) {

        var children = object.children;

        for ( var i = 0, l = children.length; i < l; i ++ ) {
            intersectObject( children[ i ], raycaster, intersects, true );
        }

    }
}

var CustomRaycaster = function(){
    THREE.Raycaster.call(this)

    this.objects = [];
    this.intersected = null;
}

CustomRaycaster.prototype = Object.create(THREE.Raycaster.prototype);
CustomRaycaster.prototype.constructor = CustomRaycaster.prototype;

CustomRaycaster.prototype.setObject = function(obj){
    this.objects.push(obj);
}

CustomRaycaster.prototype.setCamera = function(camera){
    this.camera = camera;
};

CustomRaycaster.prototype.setControls = function (controls) {
    this.controls = controls;
};

CustomRaycaster.prototype.update = function(controller1, controller2, line1, room){

    //this.setFromCamera(mouse, this.camera);
    var transformedOriginVertice = new THREE.Vector3().copy(originVertice).applyMatrix4(controller1.matrix);
    var direction = new THREE.Vector3().copy(originDirection).applyMatrix4(controller1.matrix);
    var directionNormalizedVec = new THREE.Vector3().copy(direction).sub(transformedOriginVertice).normalize();

    this.set( transformedOriginVertice, directionNormalizedVec );
    var intersetcs = this.intersectObjects(this.objects, false);

    if(intersetcs.length > 0 && intersetcs[0].object.mouseEnable ){
        if( intersetcs[0].object && intersetcs[0].object != appStore.mouseOverProject ){
            appAction.mouseOver(intersetcs[0].object);
        }

    }else{
        if(appStore.mouseOverProject) {
            console.log('mouseOut');
            appAction.mouseOut();
        }
    }

    if(intersetcs.length > 0){
        line1.geometry.vertices[0] = transformedOriginVertice;
        line1.geometry.vertices[1] = intersetcs[0].point;

        line1.geometry.verticesNeedUpdate = true;
        line1.frustumCulled = false;
        line1.visible = true;
    }else{


        line1.geometry.vertices[0] = transformedOriginVertice;
        line1.geometry.vertices[1] = transformedOriginVertice.clone().addScaledVector(directionNormalizedVec, 3);

        line1.geometry.verticesNeedUpdate = true;
        line1.frustumCulled = false;
        line1.visible = true;
    }

}
CustomRaycaster.prototype.intersectObjects = function ( objects, recursive ) {

    var intersects = [];

    if ( Array.isArray( objects ) === false ) {

        console.warn( 'THREE.Raycaster.intersectObjects: objects is not an Array.' );
        return intersects;

    }

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        intersectObject( objects[ i ], this, intersects, recursive );

    }

    intersects.sort( descSort );

    return intersects;

}

var customRayCaster = new CustomRaycaster();
module.exports = customRayCaster;