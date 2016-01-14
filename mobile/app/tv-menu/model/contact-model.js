var constants = require('../../utils/constants');

var ContactModel = function( row, col ){
    this.row = row;
    this.col = col;

    this.type = constants.contactPage.type[this.row][this.col];
    this.url = window.app.assets.json.contactData[this.type].url;
    this.isMail = window.app.assets.json.contactData[this.type].isMail;

    this.clickable = true;
};

THREE.EventDispatcher.prototype.apply( ContactModel.prototype );

ContactModel.prototype.reset = function(){

}

module.exports = ContactModel;

