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
      console.log('item selected', event.eventData);
    });
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
