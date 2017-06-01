const RouterController = require('lib/router_controller');
const template = require('./random_post.html');
const styles = require('./random_post.styl');


class RandomPostController extends RouterController {
  get current_post_id(){
    var [...keys] = this.state.queue.keys();
    return keys[this.state.queue.size - 1];
  }
  get prev_post_id(){
    var [...keys] = this.state.queue.keys();
    return keys[this.state.queue.size - 2];
  }

  load_by_id(post_id = "random"){
    return new Promise((resolve, reject) => {
      if(this.getAttribute('prerendered') === 'true'){
        setTimeout(() => {
          resolve(false);
        }, 0);
        return;
      }
      if(this.state && this.state.queue.has(post_id)){
        console.log('item from cache');
        resolve(this.state.queue.get(post_id));
        return;
      }
      fetch(`/api/post/${post_id}`)
      .then(response => response.json())
      .then((posts) => resolve(posts))
    }).then((posts) => {
      this.setAttribute('prerendered', 'false');
      if(posts){
        var current_post_id = posts[0].id;
        this.state.queue.set(current_post_id, posts);
        this.querySelector('posts-controller').render(posts);
        if(post_id === 'random'){
          this.router.navigate('/' + current_post_id);
        }
      }

      this.style = '';
      this.classList.add('with-post');
      return;
    });
  }

  prev(){
    window.history.back();
  }

  next(){
    this.load_by_id();
  }

  connectedCallback(){
    super.connectedCallback();
    console.log('random post ctrl');
    this.state = {
      queue: new Map(),
    };

    this.on(
      "component-attached", "posts-controller", ({target}) => this.$posts_controller = target
    );
    this.on(
      "component-attached", "mighty-preloader", ({target}) => this.$preloader = target
    );
    this.on("click", ".random_post_button", (event) => {
      event.preventDefault();
      this.$preloader.show();
      this.next();
    });

    this.on("click", ".prev-button", () => this.prev());


    //this.on("swipeleft", ".post-row", () => this.next());
    //this.on("swiperight", ".post-row", () => this.prev());
    //document.addEventListener("keydown", ({keyCode}) => {
      //(keyCode === 37) && this.prev();
      //(keyCode === 39) && this.next();
    //});

  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    if(value === prev){
      return;
    }

    switch(name){
      case 'post_id':
        this.load_by_id(+value).catch((e) => {});
        break;
    }
  }
  static get observedAttributes() {
    return ['post_id'];
  }
  get routes(){
    let self = this;
    return {
      '/'(path){
        self.html(template({}));
        self.classList.remove('with-post');
      },
      '/(\\d+)/:slug?'(post_id){
        if(!self.childNodes.length){
          self.html(template({}));
          self.setAttribute('prerendered', 'false');
        }
        self.setAttribute('post_id', post_id);
      },
    }
  }
}

module.exports = customElements.define('random-post-controller', RandomPostController);
