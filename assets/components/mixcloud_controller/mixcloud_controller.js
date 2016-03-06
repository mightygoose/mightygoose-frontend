const BaseController = require('lib/base_controller');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./mixcloud_controller.html');
const styles = require('./mixcloud_controller.styl');
const Delegate = require('dom-delegate');
const _ = require('lodash');

class MixcloudController extends BaseController {
  changeInputHandler(event, target){
    this.$mixcloud_url_form.classList.remove('invalid');
    this.$mixcloud_url_form.classList.remove('valid');

    var parser = document.createElement('a');
    parser.href = target.value;

    if(target.value === ""){
      this.$loader.parentElement && this.$loader.classList.add('hidden');
      return false;
    }
    if(!~parser.hostname.indexOf('mixcloud.com')){
      console.log('invalid link');
      this.$mixcloud_url_form.classList.add('invalid');
      this.$loader.parentElement && this.$loader.classList.add('hidden');
      return false;
    } else {
      this.$mixcloud_url_form.classList.add('valid');
    }
    this.$loader.parentElement && this.$loader.classList.remove('hidden');
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
  }

  create(){
    var delegate = new Delegate(this);

    console.log('mixcloud ctrl');
    this.innerHTML = template();

    this.$loader = this.querySelector('#mixcloud_tracklist_preloader');
    this.$mixcloud_url_form = this.querySelector('#mixcloud_url_form');
    this.$mixcloud_url_input = this.querySelector('#mixcloud_url_input');

    delegate.on('paste', '#mixcloud_url_input', _.debounce(_.bind(this.changeInputHandler, this), 500));
    delegate.on('keyup', '#mixcloud_url_input', _.throttle(_.bind(this.changeInputHandler, this), 100));
  }
  attach(){
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('mixcloud-controller', MixcloudController);
