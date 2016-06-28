const BaseController = require('ascesis').BaseController;
const template = require('raw!./search_posts.html');
const styles = require('./search_posts.styl');
const _ = require('lodash');
const Delegate = require('dom-delegate');


class SearchPostsController extends BaseController {
  create() {
    console.log('search posts ctrl');
    this.html(template);
    this.addEventListener('mg-autocomplete-item-selected', (event) => {
      var {eventData: data} = event;
      if(data.type !== 'tags_suggestion'){
        fetch(`/api/post/${data.id}`)
        .then((response) => response.json())
        .then((posts) => {
          this.childComponents.querySelector('posts-controller').render(posts);
        });
      } else {
        fetch(`/api/search/tag?q=${data.autocomplete_value}`)
        .then((response) => response.json())
        .then((ids) => {
          //showcase
          fetch(`/api/post/${ids[0]}`)
          .then((response) => response.json())
          .then((posts) => {
            this.childComponents.querySelector('posts-controller').render(posts);
          });
        });
      }
    });

  }
  attach(){
    //debugger;
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
