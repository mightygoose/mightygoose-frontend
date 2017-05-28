const { BaseComponent } = require('ascesis');
//const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./lazy_image.html');

class LazyImage extends BaseComponent {
  connectedCallback(){
    super.connectedCallback();

    this
      .load_list(this.src)
      .then(($img) => {
        this.html('');
        this.appendChild($img);
      })
      .catch(() => {
        this.html(`
          <span>no image</span>
        `);
      });

  }

  load_list(list){
    const [head, ...tail] = list;
    return tail.reduce((acc, item) => {
      return acc.catch(() => {
        return this.load_image(item);
      });
    }, this.load_image(head));
  }

  load_image(src){
    return new Promise((resolve, reject) => {
      const $img = new Image();
      $img.src = src;
      $img.addEventListener('load', () => {
        resolve($img);
      });
      $img.addEventListener('error', () => {
        reject(false);
      });
    });
  }

  get src(){
    return this.attr('src').split(',');
  }

  set src(value){
    this.attr('src', [].concat(value).join(','));
  }
}

module.exports = customElements.define('lazy-image', LazyImage);
