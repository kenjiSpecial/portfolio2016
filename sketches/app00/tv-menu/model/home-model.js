
var HomeModel = function( row, col ){
    this.row = row;
    this.col = col;
    this.clickable = true;
};

THREE.EventDispatcher.prototype.apply( HomeModel.prototype );

HomeModel.prototype.reset = function(){

}

module.exports = HomeModel;

