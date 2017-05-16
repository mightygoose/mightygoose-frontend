//critical css
require('file?name=../../assets/main.css!stylus!./main.styl');

const { BaseController, html, attr } = require('ascesis');
const RouterController = require('lib/router_controller');


class MainController extends RouterController {
  connectedCallback(){
    super.connectedCallback();

    console.log("application ready");

    var $content_section = document.querySelector("#content_section");
    var buffer = document.createDocumentFragment();

    window.router = this.router;

    let table = {
      'post':     this.querySelector('random-post-controller') || document.createElement('random-post-controller' ),
      'search':   this.querySelector('search-posts-controller') || document.createElement('search-posts-controller'),
      'user':     this.querySelector('user-profile-controller') || document.createElement('user-profile-controller'),
      'mixcloud': this.querySelector('mixcloud-controller') || document.createElement('mixcloud-controller'),
      'welcome':  this.querySelector('welcome-page-controller') || document.createElement('welcome-page-controller')
    };

    this.router.add('/*', (path) => {
      let controller_name = path.split('/')[0];
      let $controller = table[controller_name];
      attr($controller, 'router-base', controller_name);
      if(!($content_section.children[0] === $controller)){
        $content_section.children[0] && buffer.appendChild($content_section.children[0]);
        $content_section.appendChild($controller);
      }
    });

    if(this.router.getPath() === '/'){
      this.router.navigate('/post/');
    } else {
      this.router.resolve();
    }

    this.on('click', '.next-button', () => {
      this.send_metric('next_button');
    });
    this.on('click', '.prev-button', () => {
      this.send_metric('prev_button');
    });
    this.on('click', '.original-post-link', () => {
      this.send_metric('original_post_link');
    });
    this.on('click', 'itunes-widget .track-list-track', () => {
      this.send_metric('itunes_widget');
    });
    this.on('click', '.icon-discogs_logo', () => {
      this.send_metric('discogs_link');
    });
    this.on('click', '.itunes-link', () => {
      this.send_metric('itunes_link');
    });

    this.on('user-authorised', 'login-bar', () => {
      console.log('authorised');
    });
  }

  send_metric(metric_name){
    document.createElement('img').setAttribute('src', `/metrics/${metric_name}`)
  }
}

module.exports = customElements.define('main-controller', MainController, {extends: 'body'});
