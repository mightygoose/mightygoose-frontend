const BaseController = require('ascesis').BaseController;
const Router = require('router').default;
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

  connectedCallback(){
    super.connectedCallback();

    var delegate = new Delegate(this);

    console.log('mixcloud ctrl');
    this.html(template());

    this.$loader = this.querySelector('#mixcloud_tracklist_preloader');
    this.$mixcloud_url_form = this.querySelector('#mixcloud_url_form');
    this.$mixcloud_url_input = this.querySelector('#mixcloud_url_input');

    let url_match = location.search.match(/^\?url=(.*)/);
    if(url_match){
      this.$mixcloud_url_input.value = url_match[1];
      this.changeInputHandler(null, this.$mixcloud_url_input);
    }

    //delegate.on('paste', '#mixcloud_url_input', _.debounce(_.bind(this.changeInputHandler, this), 500));
    delegate.on('keyup', '#mixcloud_url_input', _.debounce(_.bind(this.changeInputHandler, this), 300));
  }

  get router(){
    this._router || (this._router = new Router({ routes: this.routes }));
    return this._router;
  }
  get routes(){
    let self = this;
    return {
      '.*'(){
        console.log('mixcloud ctrl');
      },
    }
  }
}

module.exports = customElements.define('mixcloud-controller', MixcloudController);
