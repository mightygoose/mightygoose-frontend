const BaseController = require('ascesis').BaseController;

class PostsController extends BaseController {
  connectedCallback(){
    super.connectedCallback();
    console.log('posts ctrl');
  }
  render(posts, append){
    append || (this.innerHTML = "");
    var fragment = document.createDocumentFragment();
    posts.forEach((post) => {
      var post_item = document.createElement("post-item");
      post_item.render(post);
      fragment.appendChild(post_item);
    });
    this.appendChild(fragment);
  }
}

module.exports = customElements.define('posts-controller', PostsController);
