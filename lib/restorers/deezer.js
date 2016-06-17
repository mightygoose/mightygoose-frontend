const request = require('request');
const btc = require('bloom-text-compare');

const URL_BASE = 'https://api.deezer.com/search/album';

module.exports = (item) => {
  return new Promise((resolve, reject) => {
    var title = item.title.replace(/ /ig, '+');
    request(`${URL_BASE}&q=${title}`, (error, header, response) => {
      if(error){
        reject(error);
        return;
      }
      resolve(response);
    });
  })
  .then(response => JSON.parse(response))
  .then(response => response.data)
  .then((results) => {
    if(!results.length){ return null; }
    var item_title = item.title.toLowerCase();

    var deezer_item = results[0];
    var deezer_title = `${deezer_item.artist.name} - ${deezer_item.title}`.toLowerCase();
    var similarity;
    if(item_title === deezer_title){
      similarity = 1;
    } else {
      var hash1 = btc.hash(deezer_title.split(' '));
      var hash2 = btc.hash(item_title.split(' '));
      var similarity = btc.compare(hash1, hash2);
      if(similarity < 0.5){ return null; }
    }
    return {
      track_count: deezer_item.nb_tracks,
      artist: deezer_item.artist.name,
      album: deezer_item.title,
      similarity: similarity,
      deezer_link: deezer_item.link,
      tracklist_url: deezer_item.tracklist,
      id: deezer_item.id
    }
  }).catch(() => {});
};



