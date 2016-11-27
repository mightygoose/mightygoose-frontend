const BaseComponent = require('ascesis').BaseComponent;

class LazyLoad extends BaseComponent {
  connectedCallback(){
    super.connectedCallback();
    var src = this.getAttribute('src');
    console.log(`lazy loading ${src}`);
    let cb = () => {
      this.setAttribute('href', src);
    };
    let raf = requestAnimationFrame || mozRequestAnimationFrame ||
        webkitRequestAnimationFrame || msRequestAnimationFrame;
    window.addEventListener('load', cb);
  }
}

module.exports = customElements.define('lazy-load', LazyLoad, {extends: 'link'});
