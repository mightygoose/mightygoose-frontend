const BaseComponent = require('lib/base_component');

class LazyLoad extends BaseComponent {
  attach(){
    var src = this.getAttribute('src');
    console.log(`lazy loading ${src}`);
    let cb = () => {
      this.setAttribute('href', src);
    };
    let raf = requestAnimationFrame || mozRequestAnimationFrame ||
        webkitRequestAnimationFrame || msRequestAnimationFrame;
    raf ? raf(cb) : window.addEventListener('load', cb);
  }
}
LazyLoad.extends = 'link';

module.exports = document.registerElement('lazy-load', LazyLoad);
