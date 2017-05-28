const { BaseComponent } = require('ascesis');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./post_thumb.html');
const styles = require('./post_thumb.styl');

class PostThumb extends BaseComponent {

  connectedCallback(){
    super.connectedCallback();

    require.ensure(['components/lazy_image/lazy_image'], () => {
      require('components/lazy_image/lazy_image');
    });

    console.log('post thumb created');

    this.html(template(this.data));
  }

  //attributeChangedCallback(name, prev, value){
    //super.attributeChangedCallback();
  //}

  //static get observedAttributes() {
    //return [];
  //}

  set data(value){
    this._data = value;
  }

  get data(){
    return this._data;
  }
}

module.exports = customElements.define('post-thumb', PostThumb);
