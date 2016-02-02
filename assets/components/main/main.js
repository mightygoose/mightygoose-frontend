const BaseController = require('lib/base_controller');
const Router = require('director').Router;
const _ = require('lodash');

class MainController extends BaseController {
  create() {
    console.log("application ready");

    var $content_section = document.querySelector("#content_section");

    var routes = {
      '/random': function () {
        $content_section.innerHTML = '<div is="random-post-controller"></div>';
      },
      '/search': function () {
        $content_section.innerHTML = '<div is="search-posts-controller"></div>';
      },
      '/post/?((\w|.)*)': function (post_id) {
        console.log("post id", post_id);
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
