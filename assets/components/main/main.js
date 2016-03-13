//critical css
require('file?name=../../main.css!stylus!./main.styl');

const BaseController = require('lib/base_controller');
const Router = require('director').Router;


class MainController extends BaseController {
  create() {
    console.log("application ready");

    var $content_section = document.querySelector("#content_section");
    var $random_post = document.createElement('random-post-controller');

    var routes = {
      '/search': function () {
        document.querySelector("#search-link").classList.add("active-menu-item");
        document.querySelector("#random-post-link").classList.remove("active-menu-item");
        $content_section.innerHTML = '<search-posts-controller></search-posts-controller>';
      },
      '/post': {
        //think of something better here!
        on(){
          document.querySelector("#random-post-link").classList.add("active-menu-item");
          document.querySelector("#search-link").classList.remove("active-menu-item");
          $content_section.innerHTML = '';
          $content_section.appendChild($random_post);
        },
        '/random': function (next) {
          next();
        },
        '/:post_id': function (post_id, next) {
          $random_post.setAttribute('post_id', post_id);
          if(!$random_post.parentNode){
            next();
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


    var router = Router(routes).configure({ recurse: 'backward', async: true });
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
