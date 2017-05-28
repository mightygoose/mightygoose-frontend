const { BaseComponent } = require('ascesis');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./post_thumb.html');
const styles = require('./post_thumb.styl');

const POSTS_PATH = '/post';

class PostThumb extends BaseComponent {

  connectedCallback(){
    super.connectedCallback();

    require.ensure(['components/lazy_image/lazy_image'], () => {
      require('components/lazy_image/lazy_image');
    });

    console.log('post thumb created');

    this.html(template(Object.assign({}, this.data, {
      link: `${POSTS_PATH}/${this.data.id}`
    })));
  }

  set data(value){
    this._data = value;
  }

  get data(){
    return this._data;
  }

}

module.exports = customElements.define('post-thumb', PostThumb);
