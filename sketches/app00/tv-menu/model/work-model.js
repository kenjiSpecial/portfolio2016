
var WorkModel = function( row, col ){
    this.row = row;
    this.col = col;

    var number = this.row * 3 + col;


    this.clickable = false;
};

THREE.EventDispatcher.prototype.apply( WorkModel.prototype );

WorkModel.prototype.reset = function(){

}

module.exports = WorkModel;

