const BaseController = require('lib/base_controller');
const Delegate = require('dom-delegate');
const template = require('ejs!./random_post.html');
const styles = require('./random_post.styl');


class RandomPostController extends BaseController {
  create() {
    console.log('random post ctrl');

    var delegate = new Delegate(this);
    delegate.on("click", "#random_post_button", (event) => {
      event.preventDefault();
      this.querySelector("mighty-preloader").show();
      fetch("/api/post/random")
      .then(response => response.json())
      .then((posts) => {
        this.childComponents.querySelector('posts-controller').render(posts);
        this.classList.add('with-post');
        //router.setRoute('/post/' + posts[0]._key);
      });
    });

  }
  attach(){
    this.innerHTML = template();
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('random-post-controller', RandomPostController);
