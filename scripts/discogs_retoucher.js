var btc = require('bloom-text-compare');
var _ = require('lodash');


var stream = process.stdin;

var content = "";
stream.on('data', function(data) {
  content += data.toString();
});

stream.on('end', function(data) {
  var item = JSON.parse(content);
  //console.log(item);
  if(!item.discogs.title) {
    console.log(JSON.stringify(item));
    return;
  }
  var title1 = item.title.replace(/[^a-zA-Z0-9 ]/ig, '').toLowerCase();
  var title2 = item.discogs.title.replace(/[^a-zA-Z0-9 ]/ig, '').toLowerCase();
  var hash1 = btc.hash(title1.split(' '));
  var hash2 = btc.hash(title2.split(' '));

  var distance = btc.compare(hash1, hash2);
  item['discogs_title_similarity'] = distance;
  if(distance > 0.5){
    item['badges'].push('discogs-title-similarity-good');
  }
  console.log(JSON.stringify(item));
});

