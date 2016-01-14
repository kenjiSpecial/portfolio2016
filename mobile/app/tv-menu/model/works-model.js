
var WorksModel = function( row, col ){
    this.row = row;
    this.col = col;

    var number = this.row * 3 + col;
    var worksData = window.app.assets.json.workData[number]
    this.worksData = worksData;

    this.id    = this.worksData.id;
    this.title = worksData.title;
    this.thumbnail = worksData.thumbnail;
    
    this.clickable = true; //worksData.visit ? true : false;
};

THREE.EventDispatcher.prototype.apply( WorksModel.prototype );

WorksModel.prototype.reset = function(){

};

module.exports = WorksModel;

