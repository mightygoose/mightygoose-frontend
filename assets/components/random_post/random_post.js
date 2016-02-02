const BaseController = require('lib/base_controller');
const Delegate = require('dom-delegate');
const template = require('ejs!./random_post.html');


class RandomPostController extends BaseController {
  create() {
    console.log('random post ctrl');

    var delegate = new Delegate(this);
    delegate.on("click", "#random_post_button", (event) => {
      event.preventDefault();
      var $random_post_spinner = document.querySelector("#random_post_spinner");
      $random_post_spinner.classList.remove('hidden');
      fetch("/api/post/random")
      .then(response => response.json())
      .then((posts) => {
        this.childComponents.querySelector('posts-controller').render(posts);
        $random_post_spinner.classList.add('hidden');
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
