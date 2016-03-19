//critical css
require('file?name=../../assets/main.css!stylus!./main.styl');

const BaseController = require('lib/base_controller');
const Router = require('director').Router;


class MainController extends BaseController {
  create() {
    console.log("application ready");
    var self = this;

    var $content_section = document.querySelector("#content_section");

    var routes = {
      '/search': function () {
        document.querySelector("#search-link").classList.add("active-menu-item");
        document.querySelector("#random-post-link").classList.remove("active-menu-item");
        $content_section.innerHTML = '<search-posts-controller></search-posts-controller>';
      },
      '/post': {
        //think of something better here!
        on(post_id = ''){
          document.querySelector("#random-post-link").classList.add("active-menu-item");
          document.querySelector("#search-link").classList.remove("active-menu-item");
          $content_section.innerHTML = `<random-post-controller post_id="${post_id}"/>`;
        },
        '/random': function () {
        },
        '/:post_id': function (post_id) {
          let $random_post_controller = self.childComponents.querySelector('random-post-controller');
          if($random_post_controller){
            $random_post_controller.setAttribute('post_id', post_id);
            return false;
          }
        }
      },
      '/mixcloud': function () {
        //document.querySelector("#mixcloud-link").classList.add("active-menu-item");
        //document.querySelector("#random-post-link").classList.remove("active-menu-item");
        $content_section.innerHTML = '<mixcloud-controller></mixcloud-controller>';
      },
      '/statistic': function () {
        console.log("statistic");
      }
    };


    var router = Router(routes).configure({ recurse: 'backward'});
    router.init('post/random');

    this.addEventListener('post-rendered', ({target: controller}) => {
      router.setRoute(`/post/${controller.current_post_id}`);
    });
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}
MainController.extends = 'body';

module.exports = document.registerElement('main-controller', MainController);
