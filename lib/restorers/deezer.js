"use strict"

const BaseRestorer = require('lib/restorers/base');

const request = require('request');

const URL_BASE = 'https://api.deezer.com/search/album';

class DeezerAlbumRestorer extends BaseRestorer.BaseAlbumRestorer {
  request(item){
    return new Promise((resolve, reject) => {
      var title = item.title.replace(/ /ig, '+');
      request(`${URL_BASE}&q=${encodeURIComponent(title)}`, (error, header, response) => {
        if(response === 'HTTP_NOT_FOUND'){
          reject(response);
          return;
        }
        if(error){
          reject(error);
          return;
        }
        resolve(response);
      });
    })
    .then(response => JSON.parse(response))
    .then(response => response.data);
  }
  get_title(restorer_item){
    return `${restorer_item.artist.name} - ${restorer_item.title}`;
  }
  get_fields(restorer_item){
    return {
      track_count: restorer_item.nb_tracks,
      artist: restorer_item.artist.name,
      album: restorer_item.title,
      deezer_link: restorer_item.link,
      tracklist_url: restorer_item.tracklist,
      id: restorer_item.id
    };
  }
}

module.exports = {
  AlbumRestorer: DeezerAlbumRestorer
}


