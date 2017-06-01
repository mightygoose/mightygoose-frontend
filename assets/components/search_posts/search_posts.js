const RouterController = require('lib/router_controller');
const template = require('./search_posts.html');
const styles = require('./search_posts.styl');
const _ = require('lodash');


class SearchPostsController extends RouterController {
  render_first(append){
    var [first, ...others] = this.posts;
    if(!first){
      return;
    }
    this.posts = others;
    (this.preloader || (
      this.preloader = this.querySelector('.search-preloader')
    )).show();
    fetch(`/api/post/${first}`)
    .then((response) => response.json())
    .then((posts) => {
      this.querySelector('posts-controller').render(posts, append);
      this.preloader.hide();
    });
  }
  connectedCallback(){
    super.connectedCallback();
    console.log('search posts ctrl');

    this.posts = [];

    this.on('mg-autocomplete-item-selected', (event) => {
      var {eventData: data} = event;
      if(data.type !== 'tags_suggestion'){
        this.router.navigate(`/post/${data.id}`, { absolute: true });
      } else {
        this.router.navigate(`?tag=${data.title}`)
      }
    });

    let handler = () => this.handle_infinite_scroll();
    window.addEventListener('scroll', handler);
  }

  disconnectedCallback(){
    super.disconnectedCallback();
    //window.removeEventListener('scroll', handler);
  }

  handle_infinite_scroll(event){
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight){
      this.render_first(true);
    }
  }

  search_by_tag(tag){
    return fetch(`/api/search/tag?q=${tag}`)
    .then((response) => response.json())
    .then((ids) => {
      this.posts = ids;
      this.render_first();
    });
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    switch(name){
      case 'tag':
        this.search_by_tag(value).catch((e) => {
          console.log(`error searching by tag: ${e}`)
        });
        break;
    }
  }
  static get observedAttributes() {
    return ['tag'];
  }

  get routes(){
    let self = this;
    return {
      '/'(q){
        if(!self.childNodes.length){
          self.html(template());
        }
        if(q.tag){
          self.setAttribute('tag', q.tag);
        }
      },
    }
  }
}

module.exports = customElements.define('search-posts-controller', SearchPostsController);
