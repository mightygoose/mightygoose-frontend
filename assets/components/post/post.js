const BaseComponent = require('lib/base_component');
const template = require('ejs!./post.html');
const styles = require('./post.styl');

class PostItem extends BaseComponent {
  render(data){
    this.innerHTML = template(data);
    if(data.discogs){
      fetch("/api/discogs_info", {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data.discogs)
      })
      .then(response => response.json())
      .then((discogs_info) => {
        var tracklist_block = this.querySelector('.item-tracklist');
        var tracklist = document.createElement('track-list');
        tracklist_block.appendChild(tracklist);

        var artist = discogs_info.artists.map(artist => artist.name).join(' & ');
        var tracklist_object = discogs_info.tracklist.map(track => {
          return Object.assign({}, track, {artist});
        });

        tracklist.render(tracklist_object);
      });
    }
  }
  create(){
    console.log('post item created');
  }
}

module.exports = document.registerElement('post-item', PostItem);
