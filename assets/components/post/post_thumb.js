const { BaseComponent } = require('ascesis');
const template = require('./post_thumb.html');
const styles = require('./post_thumb.styl');

const POSTS_PATH = '/post';

class PostThumb extends BaseComponent {

  connectedCallback(){
    super.connectedCallback();

    require.ensure(['components/lazy_image/lazy_image'], () => {
      require('components/lazy_image/lazy_image');
    });

    console.log('post thumb created');
  }

  render(data = this.data){
    this.html(template(Object.assign({}, data, {
      link: `${POSTS_PATH}/${data.id}`
    })));
  }

  set data(value){
    this._data = value;
    this.render();
  }

  get data(){
    return this._data;
  }

}

module.exports = customElements.define('post-thumb', PostThumb);
