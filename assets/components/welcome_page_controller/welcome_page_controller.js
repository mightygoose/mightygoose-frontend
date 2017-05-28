const RouterController = require('lib/router_controller');
const { attr } = require('ascesis');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./welcome_page_controller.html');
const styles = require('./welcome_page_controller.styl');


class WelcomePageController extends RouterController {

  connectedCallback(){
    require.ensure(['components/posts_gallery_controller/posts_gallery_controller'], () => {
      require('components/posts_gallery_controller/posts_gallery_controller');
      this.html(template({}));
      super.connectedCallback();
    });


  }

  get routes(){
    let self = this;
    return {
      '*'(){
        attr(
          self.querySelector('posts-gallery-controller'),
          'limit',
          this.getParams().limit || attr(self.querySelector('posts-gallery-controller'), 'limit') || 9
        );
      },
      '/'(){
        self.querySelector('[role="posts-infobox-label"]').innerHTML = 'random posts';
        attr(
          self.querySelector('posts-gallery-controller'),
          'tags',
          '[]'
        );
      },
      '/:type/:value'(type, value){
        self.querySelector('[role="posts-infobox-label"]').innerHTML = `posts tagged "${value}"`;
        attr(
          self.querySelector('posts-gallery-controller'),
          type,
          JSON.stringify(decodeURIComponent(value).split(','))
        );
      }
    }
  }
}

module.exports = customElements.define('welcome-page-controller', WelcomePageController);
