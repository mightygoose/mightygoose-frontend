const { BaseController, html } = require('ascesis');
const { map_to_fragment } = require('lib/helpers');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends BaseController {

  connectedCallback(){
    super.connectedCallback();

    this.html(template(this.params));

    this.$posts_table = this.querySelector('[role="gallery-table"]');

    this.generate_posts_fragment = map_to_fragment((post) => {
      const $post = document.createElement('img');
      $post.src = post.discogs.thumb || post.images[0];
      return $post;
    });
  }

  load_posts(params = this.params){
    return fetch('/api/search/posts', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then((result) => {
      const $fragment = this.generate_posts_fragment(result);
      this.$posts_table.appendChild($fragment);
    });
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    if(prev === value){
      return;
    }

    this.load_posts();
  }

  static get observedAttributes() {
    return ['tags', 'offset'];
  }

  get params(){
    return {
      tags: JSON.parse(this.attr('tags')),
      limit: +(this.attr('limit') || 9),
      offset: +(this.attr('offset') || 0)
    }
  }
}

module.exports = customElements.define('posts-gallery-controller', PostsGalleryController);
