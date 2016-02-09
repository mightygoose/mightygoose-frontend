const BaseController = require('lib/base_controller');
const template = require('raw!./search_posts.html');
const styles = require('style!css!stylus!./search_posts.styl');
const _ = require('lodash');
const Delegate = require('dom-delegate');


class SearchPostsController extends BaseController {
  create() {
    console.log('search posts ctrl');
    var delegate = new Delegate(this);
    delegate.on("click", "#search_posts_button", (event) => {
      event.preventDefault();
      var $random_post_spinner = document.querySelector("#search_posts_spinner");
      $random_post_spinner.classList.remove('hidden');
      var tags = this.childComponents.querySelector('tag-form').get_tags();
      fetch("/api/search/tags", {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tags)
      })
      .then(response => response.json())
      .then((posts) => {
        this.childComponents.querySelector('posts-controller').render(posts);
        $random_post_spinner.classList.add('hidden');
      });
    })

  }
  attach(){
    this.innerHTML = template;
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
