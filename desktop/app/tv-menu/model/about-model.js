
var AboutModel = function( row, col ){
    this.row = row;
    this.col = col;
    this.clickable = false;

    if(this.row == 0 && this.col == 2){
        this.clickable = true;
        this.url       = 'https://github.com/kenjiSpecial'
    }else if(this.row == 2 && this.col == 2){
        this.clickable = true;
        this.url = "https://www.linkedin.com/in/kenji-saito-5a327340";
    }
};

THREE.EventDispatcher.prototype.apply( AboutModel.prototype );

AboutModel.prototype.reset = function(){

}

module.exports = AboutModel;

