const { BaseController, html } = require('ascesis');
const { map_to_fragment } = require('lib/helpers');

const template = require('./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');

const generate_posts_fragment = map_to_fragment((post) => {
  const $post = document.createElement('post-thumb');
  $post.data = post;
  return $post;
});

class PostsGalleryController extends BaseController {

  connectedCallback(){
    require.ensure(['components/post/post_thumb', 'components/preloader/preloader'], () => {
      require('components/post/post_thumb');
      require('components/preloader/preloader');
    });
    super.connectedCallback();

    this.on('click', '[role="load-more-posts-button"]', () => {
      this.attr('offset', this.params.offset + this.params.limit);
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

    if(!append){
      html('', this.$posts_table);
    }

    if(data){
      this.show_preloader();
      Promise.resolve(data).then(generate_posts_fragment).then(($fragment) => {
        this.$posts_table.appendChild($fragment);
        this.hide_preloader();

        this.trigger('posts-gallery-rendered');
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

    const offset_changed = (name === 'offset');

    if(!offset_changed){
      this.removeAttribute('offset');
    }

    this.render(this.load_posts(), offset_changed);
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
