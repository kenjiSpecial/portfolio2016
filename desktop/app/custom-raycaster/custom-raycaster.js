var appAction = require('../actions/app-action');
var appStore  = require('../stores/app-store');

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

CustomRaycaster.prototype.update = function(mouse){

    this.setFromCamera(mouse, this.camera);

    var intersetcs = this.intersectObjects(this.objects);
    //|| !object.mouseEnable
    if(intersetcs.length > 0 && intersetcs[0].object.mouseEnable ){

        if( intersetcs[0].object && intersetcs[0].object != appStore.mouseOverProject ){
            appAction.mouseOver(intersetcs[0].object);
        }
    }else{
        if(appStore.mouseOverProject) appAction.mouseOut();
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