//critical css
require('file?name=../../assets/main.css!stylus!./main.styl');

const BaseController = require('ascesis').BaseController;
const Router = require('director').Router;
const Delegate = require('dom-delegate');


class MainController extends BaseController {
  constructor(){
    super();

    console.log("application ready");
    var self = this;

    var $content_section = document.querySelector("#content_section");

    //var routes = {
      //'/user/profile': function () {
        //$content_section.innerHTML = '<user-profile-controller></user-profile-controller>';
      //},
      //'/search': function () {
        //document.querySelector("#search-link").classList.add("active-menu-item");
        //document.querySelector("#random-post-link").classList.remove("active-menu-item");
        //$content_section.innerHTML = '<search-posts-controller></search-posts-controller>';
      //},
      //'/post': {
        ////think of something better here!
        //on(post_id = ''){
          //document.querySelector("#random-post-link").classList.add("active-menu-item");
          //document.querySelector("#search-link").classList.remove("active-menu-item");
          //$content_section.innerHTML = `<random-post-controller post_id="${post_id}"/>`;
        //},
        //'/random': function () {
        //},
        //'/:post_id/?((\w|.)*)': function (post_id) {
          //let $random_post_controller = self.childComponents.querySelector('random-post-controller');
          //if($random_post_controller){
            //$random_post_controller.setAttribute('post_id', post_id);
            //return false;
          //}
        //}
      //},
      //'/mixcloud': function () {
        //$content_section.innerHTML = '<mixcloud-controller></mixcloud-controller>';
      //},
      //'/statistic': function () {
        //console.log("statistic");
      //}
    //};


    //var router = Router(routes).configure({ recurse: 'backward', html5history: true });
    //if(router.getPath() === '/'){
      //router.init('/post/random');
    //} else {
      //router.init();
    //}

    this.addEventListener('post-rendered', ({target: controller}) => {
      router.setRoute(`/post/${controller.current_post_id}`);
    });


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


    //console.log(compa.routes);


    delegate.on('user-authorised', 'login-bar', () => {
      console.log('authorised');
    });

  }
  connectedCallback(){
    super.connectedCallback();
    console.log('test');

    var $content_section = document.querySelector("#content_section");
    var buffer = document.createDocumentFragment();

    var router = new Router().configure({ html5history: true,  recurse: 'forward' });

    let table = {
      'comp-a': '/post',
      'comp-b': '/foo',
      'comp-c': '/'
    };

    Object.keys(table).forEach((component_name) => {
      customElements.whenDefined(component_name).then(() => {
        let component = this.querySelector(component_name) || document.createElement(component_name);
        router.mount(Object.assign({}, {
          on(){
            $content_section.children[0] && buffer.appendChild($content_section.children[0]);
            $content_section.appendChild(component);
          }
        }, component.routes), table[component_name]);

        if('/'.concat(router.getRoute(0)) === table[component_name]){
          router.dispatch('on', router.getPath());
        }
      });
    });


    if(router.getPath() === '/'){
      router.init('/post/random');
    } else {
      router.init();
    }

    window.buf = buffer;
    window.router = router;

  }
  send_metric(metric_name){
    document.createElement('img').setAttribute('src', `/metrics/${metric_name}`)
  }
}

module.exports = customElements.define('main-controller', MainController, {extends: 'body'});

class CompA extends BaseController {
  constructor(){
    super();
    this.trigger('a-created');
  }
  get routes(){
    return {
      '/'(){
        console.log('alright');
        return true;
      },
      '/random': {
        on(){
          console.log('foo!');
        }
      }
    }
  }
}
customElements.define('comp-a', CompA);

class CompB extends BaseController {
  get routes(){
    return {
      '/bar': {
        on(){
          console.log('bar!');
        }
      }
    }
  }
}
customElements.define('comp-b', CompB);

class CompC extends BaseController {
  get routes(){
    return {
      '/post/random': {
        on(){
          console.log('comp c post!');
        }
      }
    }
  }
}
customElements.define('comp-c', CompC);
