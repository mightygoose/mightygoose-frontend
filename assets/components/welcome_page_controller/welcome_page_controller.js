const RouterController = require('lib/router_controller');
const { attr } = require('ascesis');

const template = require('./welcome_page_controller.html');
const styles = require('./welcome_page_controller.styl');

const { routes } = require('config/routes');

const POST_PATH = routes.post_page.route_base;


class WelcomePageController extends RouterController {

  connectedCallback(){
    require.ensure(['components/posts_gallery_controller/posts_gallery_controller'/* autocomplete */], () => {
      require('components/posts_gallery_controller/posts_gallery_controller');
    });

    this.on('mg-autocomplete-item-selected', (event) => {
      var {eventData: data} = event;
      if(data.type === 'tags_suggestion'){
        this.router.navigate(`/tags/${data.title}`)
      } else {
        this.router.navigate(`/${POST_PATH}/${data.id}`, { absolute: true });
      }
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
