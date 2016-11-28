const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./deezer-widget.html');
const styles = require('./deezer-widget.styl');

const jsonp = require('browser-jsonp');

class DeezerWidget extends BaseComponent {
  render(data){
    this.html(template(data));
  }
  connectedCallback(){
    super.connectedCallback();

    console.log('deezer widget connected');

    let self = this;
    let album_id = this.getAttribute('album-id');
    jsonp({
      url: 'https://api.deezer.com/oembed',
      data: {
        url: `https://api.deezer.com/album/${album_id}`,
        output: 'jsonp'
      },
      success(data){
        self.render(data);
      }
    });
  }
}

module.exports = customElements.define('deezer-widget', DeezerWidget);
