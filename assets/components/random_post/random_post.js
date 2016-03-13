const BaseController = require('lib/base_controller');
const Delegate = require('dom-delegate');
const template = require('ejs!./random_post.html');
const styles = require('./random_post.styl');


class RandomPostController extends BaseController {
  get current_post_id(){
    return this.state.current_post_data.id;
  }

  load_by_id(post_id = "random"){
    if(post_id === this.current_post_id){ return; }

    fetch(`/api/post/${post_id}`)
    .then(response => response.json())
    .then((posts) => {
      this.state.current_post_data = posts[0];
      this.state.cache[this.state.current_post_data.id] = posts;
      this.$posts_controller.render(posts);
      this.classList.add('with-post');
      this.trigger('post-rendered');
    });
  }

  prev(){
  }
  next(){
    this.load_by_id();
  }

  create() {
    console.log('random post ctrl');
    this.state = {
      cache: {},
      current_post_data: {}
    };
    var delegate = new Delegate(this);

    delegate.on(
      "component-attached", "posts-controller", ({target}) => this.$posts_controller = target
    );
    delegate.on(
      "component-attached", "mighty-preloader", ({target}) => this.$preloader = target
    );
    delegate.on("click", ".random_post_button", (event) => {
      event.preventDefault();
      this.$preloader.show();
      this.next();
    });
    this.innerHTML = template();
  }
  attach(){
    var post_id = this.getAttribute('post_id');
    if(post_id && post_id !== ''){
      this.load_by_id(+post_id);
    }
  }
  attributeChange(name, previousValue, value){
    if(name === 'post_id' && value && value !== ''){
      this.load_by_id(+value);
    }
  }
}

module.exports = document.registerElement('random-post-controller', RandomPostController);
