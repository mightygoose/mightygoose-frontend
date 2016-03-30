const BaseComponent = require('ascesis').BaseComponent;

class LazyLoad extends BaseComponent {
  attach(){
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
LazyLoad.extends = 'link';

module.exports = document.registerElement('lazy-load', LazyLoad);
