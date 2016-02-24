const BaseController = require('lib/base_controller');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./mixcloud_controller.html');
const styles = require('style!css!stylus!./mixcloud_controller.styl');
const Delegate = require('dom-delegate');

class MixcloudController extends BaseController {
  create(){
    var delegate = new Delegate(this);

    console.log('mixcloud ctrl');
    this.innerHTML = template();

    this.$mixcloud_url_input = this.querySelector('#mixcloud_url_input');

    delegate.on('paste', '#mixcloud_url_input', (event, target) => {
      setTimeout(() => {
        var parser = document.createElement('a');
        parser.href = target.value;

        if(!~parser.hostname.indexOf('mixcloud.com')){
          console.log('invalid link');
          return false;
        }
        fetch('/api/mixcloud/get_tracks', {
          method: 'post',
          body: JSON.stringify({
            "url": parser.href
          })
        })
        .then(response => response.json())
        .then((data) => {
          this.querySelector('mixcloud-tracklist').render(data);
        });
      }, 100);
    });
  }
  attach(){
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('mixcloud-controller', MixcloudController);
