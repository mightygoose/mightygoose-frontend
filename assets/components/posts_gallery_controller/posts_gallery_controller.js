const RouterController = require('lib/router_controller');
const { BaseController } = require('ascesis');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends BaseController {

  connectedCallback(){
    super.connectedCallback();
  }

  load_posts(params = this.params){
    return fetch('/api/search/posts', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then((result) => {
      this.html(template({
        posts: result,
      }))
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
    return ['tags'];
  }

  get params(){
    return {
      tags: JSON.parse(this.attr('tags')),
      limit: this.attr('limit') || 9
    }
  }
}

module.exports = customElements.define('posts-gallery-controller', PostsGalleryController);
