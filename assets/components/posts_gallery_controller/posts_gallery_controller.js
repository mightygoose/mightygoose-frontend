const { BaseController, html } = require('ascesis');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./posts_gallery_controller.html');
const styles = require('./posts_gallery_controller.styl');


/*
 * TODO: extract images block template
 * */

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
      const posts_html = template({
        posts: result,
      });
      if(!params.offset){
        this.html(posts_html);
      } else {
        this.appendChild(html(posts_html))
      }
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
