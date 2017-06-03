const RouterController = require('lib/router_controller');
const { attr } = require('ascesis');

const template = require('./welcome_page_controller.html');
const styles = require('./welcome_page_controller.styl');


class WelcomePageController extends RouterController {

  connectedCallback(){
    require.ensure(['components/posts_gallery_controller/posts_gallery_controller'], () => {
      require('components/posts_gallery_controller/posts_gallery_controller');
    });
    super.connectedCallback();
  }

  render(params){
    !this.childElementCount && this.html(template());

    params.infobox_label_text && (
      this.querySelector('[role="posts-infobox-label"]').innerHTML = params.infobox_label_text
    );

    params.limit && attr(
      this.querySelector('posts-gallery-controller'), 'limit', params.limit
    );

    params.type && attr(
      this.querySelector('posts-gallery-controller'), params.type, params.value
    );
  }

  get routes(){
    let self = this;
    return {
      '*'(){
        self.render({
          limit: this.getParams().limit
        });
      },
      '/'(){
        self.render({
          infobox_label_text: 'random posts',
          type: 'tags',
          value: '[]',
        });
      },
      '/:type/:value'(type, value){
        self.render({
          infobox_label_text: `${type} tagged "${decodeURIComponent(value)}"`,
          type: type,
          value: JSON.stringify(decodeURIComponent(value).split(',')),
        });
      }
    }
  }
}

module.exports = customElements.define('welcome-page-controller', WelcomePageController);
