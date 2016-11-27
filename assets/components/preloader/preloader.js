const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./preloader.html');
const styles = require('./preloader.styl');

class Preloader extends BaseComponent {
  show(){
    this.$content.classList.remove('hidden');
  }
  hide(){
    this.$content.classList.add('hidden');
  }
  connectedCallback(){
    super.connectedCallback();
    console.log('preloader created');
    this.innerHTML = template();
    this.$content = this.querySelector('.preloader-wrapper');
  }
}

module.exports = customElements.define('mighty-preloader', Preloader);
