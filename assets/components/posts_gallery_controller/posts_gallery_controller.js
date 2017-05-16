const RouterController = require('lib/router_controller');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./posts_gallery_controller.html');
//const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends RouterController {

  connectedCallback(){
    super.connectedCallback();

    this.load_posts().then((results) => {
      this.html(template({
        posts: results,
      }))
    });
  }

  load_posts(params){
    return fetch("/api/search/best_posts").then(response => response.json());
    //.then((result) => {
      //console.log(result);
    //});
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    switch(name){
      case 'tag':
        debugger;
        break;
    }
  }
  static get observedAttributes() {
    return ['tag'];
  }

  get routes(){
    let self = this;
    return {
      '/:type/:value'(type, value){
        let $gallery = self.querySelector('posts-gallery-controller');
        //self.html(template({ type, value }));
        //debugger
      }
    }
  }
}

module.exports = customElements.define('posts-gallery-controller', PostsGalleryController);
