const RouterController = require('lib/router_controller');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./welcome_page_controller.html');
//const styles = require('./welcome_page_controller.styl');


class WelcomePageController extends RouterController {

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
  get routes(){
    let self = this;
    return {
      '*'(){
        if(!self.childNodes.length){
          self.html(template({}));
        }
      },
    }
  }
}

module.exports = customElements.define('welcome-page-controller', WelcomePageController);
