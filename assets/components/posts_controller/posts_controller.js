const BaseController = require('lib/base_controller');

class PostsController extends BaseController {
  create() {
    console.log('posts ctrl');
  }
  render(posts){
    this.innerHTML = "";
    var fragment = document.createDocumentFragment();
    posts.forEach((post) => {
      var post_item = document.createElement("post-item");
      post_item.render(post);
      fragment.appendChild(post_item);
    });
    this.appendChild(fragment);
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('posts-controller', PostsController);
