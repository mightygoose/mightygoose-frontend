//critical css
require('file-loader?name=../../assets/main.css!stylus-loader!./main.styl');

const { BaseController, html, attr } = require('ascesis');
const RouterController = require('lib/router_controller');
const { routes: app_routes, index: app_index } = require('config/routes');


class MainController extends RouterController {
  connectedCallback(){
    super.connectedCallback();

    console.log("application ready");

    var $content_section = document.querySelector("#content_section");
    var buffer = document.createDocumentFragment();

    window.router = this.router;

    Object.keys(app_routes).forEach((key, index, arr) => {
      const { route_base, controller } = app_routes[key];
      const $controller = this.querySelector(controller) || document.createElement(controller);

      attr($controller, 'router-base', route_base);

      this.router.add(`${route_base}/:rest(.*)?`, () => {
        if(!($content_section.children[0] === $controller)){
          $content_section.children[0] && buffer.appendChild($content_section.children[0]);
          $content_section.appendChild($controller);
        }
      });
    }, {});

    if(this.router.getPath() === '/' && app_index !== '/'){
      this.router.navigate(app_index);
    } else {
      this.router.resolve();
    }

    this.on('click', 'a', (event, target) => {
      const { host, pathname, search } = target;
      if ((event.ctrlKey || event.metaKey) || host !== window.location.host){
        return;
      }
      event.preventDefault();
      this.router.navigate(`${pathname}${search}`);
    });

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
