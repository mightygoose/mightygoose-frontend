const BaseController = require('lib/base_controller');
const Delegate = require('dom-delegate');
const template = require('ejs!./random_post.html');


class RandomPostController extends BaseController {
  create() {
    this.innerHTML = template();
    console.log('random post ctrl');

    var delegate = new Delegate(this);
    delegate.on("click", "#random_post_button", function(event){
      event.preventDefault();
      var $posts_container = document.querySelector("#posts_container");
      var $random_post_spinner = document.querySelector("#random_post_spinner");
      $random_post_spinner.classList.remove('hidden');
      fetch("/api/post/random")
      .then(function(response){
        return response.json();
      })
      .then(function(posts){
        $posts_container.innerHTML = "";
        var post = document.createElement("post-item");
        post.render(posts[0]);
        $posts_container.appendChild(post);
        $random_post_spinner.classList.add('hidden');
        //router.setRoute('/post/' + posts[0]._key);
      });
    });
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}
RandomPostController.extends = 'div';

module.exports = document.registerElement('random-post-controller', RandomPostController);
