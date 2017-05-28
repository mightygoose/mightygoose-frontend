const BaseComponent = require('ascesis').BaseComponent;

class LazyLoad extends BaseComponent {
  connectedCallback(){
    super.connectedCallback();
    var src = this.attr('src');
    console.log(`lazy loading ${src}`);
    let cb = () => this.attr('href', src);
    let raf = requestAnimationFrame || mozRequestAnimationFrame ||
        webkitRequestAnimationFrame || msRequestAnimationFrame;
    window.addEventListener('load', cb);
  }
}

module.exports = customElements.define('lazy-load', LazyLoad, {extends: 'link'});
