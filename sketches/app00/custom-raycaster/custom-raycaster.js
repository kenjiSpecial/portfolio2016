var appAction = require('../actions/app-action');
var appStore  = require('../stores/app-store');

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
    if(!appStore.isMouseEnable) return;

    this.setFromCamera(mouse, this.camera);

    var intersetcs = this.intersectObjects(this.objects);

    if(intersetcs.length > 0){
        if( intersetcs[0].object && intersetcs[0].object != appStore.mouseOverProject ){
            appAction.mouseOver(intersetcs[0].object);
        }
    }else{
        if(appStore.mouseOverProject) appAction.mouseOut();
    }

}

var customRayCaster = new CustomRaycaster();
module.exports = customRayCaster;