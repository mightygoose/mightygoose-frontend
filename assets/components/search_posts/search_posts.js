const BaseController = require('lib/base_controller');
const template = require('raw!./search_posts.html');
const styles = require('style!css!stylus!./search_posts.styl');
const _ = require('lodash');


class SearchPostsController extends BaseController {
  create() {
    this.innerHTML = template;
    this.model = {
      filter: '',
      filter_tags: function(event, view_model){
        _.each(view_model.tags, (tag) => {
          tag.visible = view_model.filter === "" || ~tag.key.indexOf(view_model.filter);
        });
      },
      tags: []
    };
    this.scope.rivets.bind(this, this.model);
    fetch("/api/tags")
    .then(response => response.json())
    .then(tags_data => _.map(tags_data, (count, key) => {
      return {count, key, visible: true, checked: false};
    }))
    .then((tags_data) => {
      this.model.tags = tags_data;
    });

    var $random_post_button = document.querySelector("#search_posts_button");
    $random_post_button.addEventListener("click", (event) => {
      event.preventDefault();
      var $random_post_spinner = document.querySelector("#search_posts_spinner");
      $random_post_spinner.classList.remove('hidden');
      //fetch("/api/post/random")
      //.then(response => response.json())
      //.then((posts) => {
        //this.childComponents.querySelector('posts-controller').render(posts);
        //$random_post_spinner.classList.add('hidden');
        ////router.setRoute('/post/' + posts[0]._key);
      //});
    })

    console.log('search posts ctrl');
  }
  get_tags(){
    return _.map(_.filter(this.model.tags, {checked: true}), tag => tag.key);
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('search-posts-controller', SearchPostsController);
