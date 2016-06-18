const request = require('request');
const btc = require('bloom-text-compare');
const qs = require('qs');

const DISCOGS_TOKEN = process.env['DISCOGS_TOKEN'];

const URL_BASE = 'https://itunes.apple.com/search?entity=album';

module.exports = (item) => {
  return new Promise((resolve, reject) => {
    var query_string = qs.stringify({
      'type' : 'album',
      'token' : DISCOGS_TOKEN
    });
    var url = 'https://api.discogs.com/database/search?' + query_string + '&q=' + encodeURI(item['title']);
    request({
      url: url,
      headers: {
        'User-Agent': 'request'
      }
    }, (error, header, response) => {
      if(error){
        reject(error);
        return;
      }
      resolve(response);
    });
  })
  .then(response => JSON.parse(response))
  .then(response => response.results)
  .catch(() => {});
};



