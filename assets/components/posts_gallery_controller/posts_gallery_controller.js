const { BaseController, html } = require('ascesis');
const { map_to_fragment } = require('lib/helpers');

const template = require('./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends BaseController {

  connectedCallback(){
    super.connectedCallback();

    require.ensure(['components/post/post_thumb'], () => {
      require('components/post/post_thumb');
    });

    this.render();

    this.$posts_table = this.querySelector('[role="gallery-table"]');
    this.$preloader = this.querySelector('[role="preloader"]');

    this.on('click', '[role="load-more-posts-button"]', () => {
      this.attr('offset', this.params.offset + this.params.limit);
    });

    this.generate_posts_fragment = map_to_fragment((post) => {
      const $post = document.createElement('post-thumb');
      $post.data = post;
      return $post;
    });

  }

  load_posts(params = this.params, append){
    if(!append){
      html('', this.$posts_table);
    }
    this.$preloader && this.$preloader.show();
    return fetch('/api/search/posts', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then((result) => {
      const $fragment = this.generate_posts_fragment(result);
      this.$posts_table.appendChild($fragment);
      this.$preloader.hide();
    });
  }

  render(){
    this.html(template(this.params));
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    if(value === null || prev === value){
      return;
    }

    if(name === 'offset'){
      this.load_posts(this.params, true);
      return;
    }

    this.load_posts();
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    this.removeAttribute('tags');
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
