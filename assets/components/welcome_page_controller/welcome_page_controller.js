const BaseController = require('ascesis').BaseController;
const Router = require('router').Router;

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./welcome_page_controller.html');
//const styles = require('./welcome_page_controller.styl');


class WelcomePageController extends BaseController {

  connectedCallback(){
    super.connectedCallback();
  }

  attributeChangedCallback(name, prev, value){
    super.attributeChangedCallback();

    switch(name){
      case 'tag':
        break;
    }
  }
  static get observedAttributes() {
    return ['tag'];
  }
  get router(){
    this._router || (this._router = new Router({ routes: this.routes }));
    return this._router;
  }
  get routes(){
    let self = this;
    return {
      '/'(path){
        if(!self.childNodes.length){
          self.html(template({}));
        }
      },
    }
  }
}

module.exports = customElements.define('welcome-page-controller', WelcomePageController);
