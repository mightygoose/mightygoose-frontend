const { BaseController, html } = require('ascesis');
const { map_to_fragment } = require('lib/helpers');

const template = require('./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends BaseController {

  connectedCallback(){
    super.connectedCallback();

    require.ensure(['components/post/post_thumb'/*, 'preloader'*/], () => {
      require('components/post/post_thumb');
    });

    //this.render();

    //this.$posts_table = this.querySelector('[role="gallery-table"]');
    //this.$preloader = this.querySelector('[role="preloader"]');

    this.on('click', '[role="load-more-posts-button"]', () => {
      this.attr('offset', this.params.offset + this.params.limit);
    });

    this.generate_posts_fragment = map_to_fragment((post) => {
      const $post = document.createElement('post-thumb');
      $post.data = post;
      return $post;
    });

  }

  load_posts(params = this.params){
    return fetch('/api/search/posts', {
      method: 'POST',
      body: JSON.stringify(params)
    }).then(response => response.json());
  }

  render(data, append){
    !this.childElementCount && this.html(template(this.params));

    if(data){
      this.show_preloader();
      if(!append){
        html('', this.$posts_table);
      }
      Promise.resolve(data).then(this.generate_posts_fragment).then(($fragment) => {
        this.$posts_table.appendChild($fragment);
        this.hide_preloader();
      });
    }
  }

  show_preloader(){
    //should be attribute or property
    this.$preloader.show && this.$preloader.show();
  }

  hide_preloader(){
    this.$preloader.hide && this.$preloader.hide();
  }

  get $posts_table(){
    return this.querySelector('[role="gallery-table"]');
  }

  get $preloader(){
    return this.querySelector('[role="preloader"]');
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    if(value === null || prev === value){
      return;
    }

    this.render(this.load_posts(), name === 'offset');
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
