const BaseController = require('ascesis').BaseController;
const Router = require('router').default;
const template = require('raw!./search_posts.html');
const styles = require('./search_posts.styl');
const _ = require('lodash');


class SearchPostsController extends BaseController {
  render_first(append){
    var [first, ...others] = this.posts;
    if(!first){
      return;
    }
    this.posts = others;
    (this.preloader || (
      this.preloader = this.childComponents.querySelector('mighty-preloader')
    )).show();
    fetch(`/api/post/${first}`)
    .then((response) => response.json())
    .then((posts) => {
      this.childComponents.querySelector('posts-controller').render(posts, append);
      this.preloader.hide();
    });
  }
  connectedCallback(){
    super.connectedCallback();
    console.log('search posts ctrl');

    this.posts = [];

    this.addEventListener('mg-autocomplete-item-selected', (event) => {
      var {eventData: data} = event;
      if(data.type !== 'tags_suggestion'){
        this.posts = [data.id];
        this.render_first()
      } else {
        fetch(`/api/search/tag?q=${data.title}`)
        .then((response) => response.json())
        .then((ids) => {
          this.posts = ids;
          this.render_first();
        });
      }
    });

    window.addEventListener('scroll', (event) => {
      if((window.innerHeight + window.scrollY) >= document.body.offsetHeight){
        this.render_first(true);
      }
    });

  }
  get router(){
    this._router || (this._router = new Router({ routes: this.routes }));
    return this._router;
  }
  get routes(){
    let self = this;
    return {
      '*'(route, m, params){
        if(!self.childNodes.length){
          self.html(template);
        }
      },
    }
  }
}

module.exports = customElements.define('search-posts-controller', SearchPostsController);
