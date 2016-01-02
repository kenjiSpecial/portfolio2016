
var AboutModel = function( row, col ){
    this.row = row;
    this.col = col;
    this.clickable = false;
};

THREE.EventDispatcher.prototype.apply( AboutModel.prototype );

AboutModel.prototype.reset = function(){

}

module.exports = AboutModel;

