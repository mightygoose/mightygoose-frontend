const BaseController = require('ascesis').BaseController;
const template = require('raw!./search_posts.html');
const styles = require('./search_posts.styl');
const _ = require('lodash');
const Delegate = require('dom-delegate');


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
  create() {
    console.log('search posts ctrl');

    this.posts = [];

    this.html(template);
    this.addEventListener('mg-autocomplete-item-selected', (event) => {
      var {eventData: data} = event;
      if(data.type !== 'tags_suggestion'){
        this.posts = [data.id];
        this.render_first()
      } else {
        fetch(`/api/search/tag?q=${data.autocomplete_value}`)
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
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
