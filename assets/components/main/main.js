const BaseController = require('lib/base_controller');
const Router = require('director').Router;
const _ = require('lodash');
const rivets = require('rivets');

rivets.configure({
  templateDelimiters: ['{{', '}}'],
});

class MainController extends BaseController {
  create() {
    console.log("application ready");
    this.scope.rivets = rivets;

    var $content_section = document.querySelector("#content_section");

    var routes = {
      '/random': function () {
        document.querySelector("#random-post-link").classList.add("active-menu-item");
        document.querySelector("#search-link").classList.remove("active-menu-item");
        $content_section.innerHTML = '<random-post-controller></random-post-controller>';
      },
      '/search': function () {
        document.querySelector("#search-link").classList.add("active-menu-item");
        document.querySelector("#random-post-link").classList.remove("active-menu-item");
        $content_section.innerHTML = '<search-posts-controller></search-posts-controller>';
      },
      '/post/?((\w|.)*)': function (post_id) {
        console.log("post id", post_id);
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

    var router = Router(routes);
    router.init('random');
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}
MainController.extends = 'body';

module.exports = document.registerElement('main-controller', MainController);
