const BaseController = require('lib/base_controller');
const template = require('raw!./search_posts.html');
const styles = require('style!css!stylus!./search_posts.styl');
const _ = require('lodash');


class SearchPostsController extends BaseController {
  create() {
    this.innerHTML = template;
    var $random_post_button = document.querySelector("#search_posts_button");
    $random_post_button.addEventListener("click", (event) => {
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

    console.log('search posts ctrl');
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
