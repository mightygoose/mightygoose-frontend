const BaseComponent = require('lib/base_component');
const template = require('ejs!./post.html');
const styles = require('./post.styl');

class PostItem extends BaseComponent {
  render(data){
    this.innerHTML = template(data);
    if(data.discogs){
      this.querySelector('mighty-preloader').classList.remove('hidden');
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

        var artist = discogs_info.artists.map(artist => artist.name).join(' & ');
        var tracklist_object = discogs_info.tracklist.map(track => {
          return Object.assign({}, track, {artist});
        });

        this.querySelector('track-list').render(tracklist_object, {
          source: "discogs",
          uri: discogs_info.uri
        });

        var fragment = document.createDocumentFragment();
        (discogs_info.videos || []).forEach((video) => {
          let container = document.createElement('embed-container');
          container.setAttribute('src', video.uri);
          container.classList.add('row');
          container.classList.add('item-block');
          container.classList.add('embeded');
          fragment.appendChild(container);
        });
        this.querySelector('.post-embeds-container').appendChild(fragment);
      });
    }
  }
  create(){
    console.log('post item created');
  }
}

module.exports = document.registerElement('post-item', PostItem);
