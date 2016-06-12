const request = require('request');
const btc = require('bloom-text-compare');

const URL_BASE = 'https://itunes.apple.com/search?entity=album';

module.exports = (item) => {
  return new Promise((resolve, reject) => {
    var title = item.title.replace(/ /ig, '+');
    request(`${URL_BASE}&term=${title}`, (error, header, response) => {
      if(error){
        reject(error);
        return;
      }
      resolve(response);
    });
  })
  .then(response => JSON.parse(response))
  .then(response => response.results)
  .then((results) => {
    if(!results.length){ return null; }
    var item_title = item.title.toLowerCase();

    var itunes_item = results[0];
    var itunes_title = `${itunes_item.artistName} - ${itunes_item.collectionName}`.toLowerCase();
    var similarity;
    if(item_title === itunes_title){
      similarity = 1;
    } else {
      var hash1 = btc.hash(itunes_title.split(' '));
      var hash2 = btc.hash(item_title.split(' '));
      var similarity = btc.compare(hash1, hash2);
      if(similarity < 0.5){ return null; }
    }
    return {
      track_count: itunes_item.trackCount,
      price: itunes_item.collectionPrice,
      currency: itunes_item.currency,
      artist: itunes_item.artistName,
      album: itunes_item.collectionName,
      similarity: similarity,
      collection_id: itunes_item.collectionId
    }
  }).catch(() => {});
};



