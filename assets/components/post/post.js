const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./post.html');
const styles = require('./post.styl');
const _ = require('lodash');

const TAGS_PATH = '/welcome';

class PostItem extends BaseComponent {
  render(data){
    let {
      id, title, url, tags, embed,
      images, images: [main_image, ...rest_images],
      discogs, deezer, itunes
    } = data;

    /* calculate on backend! */
    let type;
    if(!(deezer || itunes)){
      type = "discogs";
    } else if((deezer || {similarity: 0}).similarity >= (itunes || {similarity: 0}).similarity){
      type = "deezer";
    } else {
      type = "itunes";
    }
    /**/

    this.html(template({
      title, url, main_image, images, tags, embed, type, deezer, itunes,
      tags_path: TAGS_PATH,
      each(list, tpl){
        return _.reduce(list, (accum, item) => accum.concat(tpl(item)), "");
      },
      post_share_link: `${window.location.origin}/post/${id}`
    }));

    if(data.discogs){
      this.setAttribute('discogs-link', data.discogs.resource_url);
    }
  }
  fetch_discogs_data(discogs_link){
    this.querySelector('mighty-preloader').classList.remove('hidden');
    fetch("/api/discogs_info", {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resource_url: discogs_link
      })
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
  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    switch(name){
      case 'discogs-link':
        (value && value !== 'false') && this.fetch_discogs_data(value);
        break;
    }
  }
  static get observedAttributes() {
    return ['discogs-link'];
  }
  connectedCallback(){
    super.connectedCallback();

    console.log('post item created');
  }
}

module.exports = customElements.define('post-item', PostItem);
