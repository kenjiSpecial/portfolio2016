
var AboutModel = function( row, col ){
    this.row = row;
    this.col = col;
    this.clickable = false;

    var number = this.row * 3 + col;
    var worksData = window.app.assets.json.workData[number]

    this.title = worksData.title;
    this.thumbnail = worksData.thumbnail;
};

THREE.EventDispatcher.prototype.apply( AboutModel.prototype );

AboutModel.prototype.reset = function(){

}

module.exports = AboutModel;

