//critical css
require('file?name=../../assets/main.css!stylus!./main.styl');

const BaseController = require('ascesis').BaseController;
const Router = require('router').default;
const Delegate = require('dom-delegate');


class MainController extends BaseController {
  connectedCallback(){
    super.connectedCallback();

    console.log("application ready");

    let router = new Router();
    window.router = router;

    var $content_section = document.querySelector("#content_section");
    var buffer = document.createDocumentFragment();

    let table = {
      'random-post-controller': '/post',
      'search-posts-controller': '/search',
      'user-profile-controller': '/user',
      'mixcloud-controller': '/mixcloud'
    };

    Object.keys(table).forEach((component_name) => {


      let promise = customElements.whenDefined(component_name)
                                  .then(() => this.querySelector(component_name) ||
                                              document.createElement(component_name))

      router.add(table[component_name] + '*', (route) => {
        promise.then((component) => {
          if(!($content_section.children[0] === component)){
            $content_section.children[0] && buffer.appendChild($content_section.children[0]);
            $content_section.appendChild(component);
          }
        });
      });

      promise.then((component) => {
        router.mount(table[component_name], component.router);
        component.router.resolve();
      });

    });

    router.resolve();

    if(router.path === '/'){
      router.navigate('/post/');
    }


    let delegate = new Delegate(this);
    delegate.on('click', '.next-button', () => {
      this.send_metric('next_button');
    });
    delegate.on('click', '.prev-button', () => {
      this.send_metric('prev_button');
    });
    delegate.on('click', '.original-post-link', () => {
      this.send_metric('original_post_link');
    });
    delegate.on('click', 'itunes-widget .track-list-track', () => {
      this.send_metric('itunes_widget');
    });
    delegate.on('click', '.icon-discogs_logo', () => {
      this.send_metric('discogs_link');
    });
    delegate.on('click', '.itunes-link', () => {
      this.send_metric('itunes_link');
    });

    delegate.on('user-authorised', 'login-bar', () => {
      console.log('authorised');
    });
  }

  send_metric(metric_name){
    document.createElement('img').setAttribute('src', `/metrics/${metric_name}`)
  }
}

module.exports = customElements.define('main-controller', MainController, {extends: 'body'});
