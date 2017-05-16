const RouterController = require('lib/router_controller');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./user_profile_controller.html');
const styles = require('./user_profile_controller.styl');


class UserProfileController extends RouterController {
  connectedCallback(){
    super.connectedCallback();

    console.log('user profile ctrl');
    this.html(template());
  }
  get routes(){
    let self = this;
    return {
      '/profile'(){
        console.log('profile');
      },
    }
  }
}

module.exports = customElements.define('user-profile-controller', UserProfileController);
