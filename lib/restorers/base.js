"use strict"
const pry = require('pryjs');

const btc = require('bloom-text-compare');

class BaseAlbumRestorer {
  request(){
    console.log('request method should be overwritten by sibling');
    return null;
  }
  restore(item){
    return this.request(item).then((results) => {
        if(!results.length){ return null; }
        var item_title = item.title.toLowerCase();

        var restorer_item = results[0];
        var restorer_title = this.get_title(restorer_item).toLowerCase();
        var similarity;
        if(item_title === restorer_title){
          similarity = 1;
        } else {
          var hash1 = btc.hash(restorer_title.split(' '));
          var hash2 = btc.hash(item_title.split(' '));
          var similarity = btc.compare(hash1, hash2);
          if(similarity < 0.5){ return null; }
        }

        return Object.assign({}, {
          similarity: similarity
        }, this.get_fields(restorer_item));

      }).catch((e) => {})
  }
  get_title(restorer_item){}
  get_fields(restorer_item){}
}

class BaseTrackRestorer {
  constructor(restore){
  }
}

module.exports = {
  BaseAlbumRestorer: BaseAlbumRestorer,
  BaseTrackRestorer: BaseTrackRestorer
}
