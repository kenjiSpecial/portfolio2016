module.exports = {
    loadJSON: function (callback, fileUrl, name) {

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function (name) {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText, name);
            }
        }.bind(null, name);
        xobj.send(null);
    }
}