var fs = require('fs');
var request = require('request');
var url = require("url");
var path = require("path");

var json = require('./RoyalCanin.json');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

for (var key in json) {
    var img_url = json[key].thumbnail_url;
    var img_name = path.basename(url.parse(img_url).pathname);
    download(img_url, 'thumb/'+ img_name, function(){
      console.log(img_name + ' done');
    });
}
