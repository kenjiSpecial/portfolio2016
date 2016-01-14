
var WorkModel = function( row, col ){
    this.row = row;
    this.col = col;

    var number = this.row * 3 + col;
    this.idNumber = number;


    this.clickable = false;
};

THREE.EventDispatcher.prototype.apply( WorkModel.prototype );

WorkModel.prototype.reset = function(){


}

WorkModel.prototype.set = function(model){
    this.model    = model;
    this.workData = this.model.worksData;

    if(this.idNumber == 8 && this.model.worksData.visit) this.clickable = true;
    else                                                 this.clickable = false;
};

module.exports = WorkModel;

