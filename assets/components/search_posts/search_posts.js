const BaseController = require('lib/base_controller');
const template = require('raw!./search_posts.html');

class SearchPostsController extends BaseController {
  create() {
    this.innerHTML = template;
    console.log('search posts ctrl');
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}
SearchPostsController.extends = 'div';

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
