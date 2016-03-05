var request = require('request');
var qs = require('qs');
var _ = require('lodash');

var discogs_token = process.env['DISCOGS_TOKEN'];

var stream = process.stdin;

var content = "";
stream.on('data', function(data) {
  content += data.toString();
});

stream.on('end', function(data) {
  var item = JSON.parse(content);

  var query_string = qs.stringify({
    'type' : 'album',
    'token' : discogs_token
  });
  var url = 'https://api.discogs.com/database/search?' + query_string + '&q=' + encodeURI(item['title']);

  var options = {
    url: url,
    headers: {
      'User-Agent': 'request'
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var results = JSON.parse(body)['results'];
      var discogs_data = _.find(results, {"type": "release"});
      if(results.length == 0 || !discogs_data){
          item['badges'].push('discogs-no-results');
          item['discogs'] = [];
          console.log(JSON.stringify(item));
          return;
      }

      item['discogs'] = discogs_data;
      if(item['title'] === discogs_data['title']){
        item['badges'].push('discogs-title-exact-match')
      }
      else {
        var prepared_item_title = _.trim(
          item['title']
          .replace(/\(\d{4}\)/ig, '')
          .replace(/\[\d{4}\]/ig, '')
          .replace(/\d{0,4}kbps/ig, '')
          .replace(/\(\)/ig, '')
          .replace(/\[\]/ig, '')
          .replace(/(\/.*)/ig, '')
          .replace(/[^0-9a-zA-Z ]+/ig, '')
          .toLowerCase());

        var prepared_discogs_title = discogs_data['title'].replace(/[^0-9a-zA-Z ]+/ig, '').toLowerCase();
        if(prepared_item_title === prepared_discogs_title){
          item['badges'].push('discogs-title-match-after-clean')
        } else {
          item['badges'].push('discogs-title-doesnt-match');
        }
      }
      console.log(JSON.stringify(item));
    }
  }

  if(item['discogs']){
      console.log(JSON.stringify(item));
      return;
  }
  setTimeout(function(){
    request(options, callback);
  }, 0);
});

