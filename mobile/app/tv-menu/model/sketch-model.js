var constants = require('../../utils/constants');

var ContactModel = function( row, col ){
    this.row = row;
    this.col = col;

    this.type = constants.sketchPage.type[this.row][this.col];
    if(this.type){
        this.url = window.app.assets.json.sketchData[this.type].url;
        this.clickable = true;
    }else{
        this.url = null;
        this.clickable = false;
    }

};

THREE.EventDispatcher.prototype.apply( ContactModel.prototype );

ContactModel.prototype.reset = function(){

}

module.exports = ContactModel;

