const BaseController = require('ascesis').BaseController;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./user_profile_controller.html');
const styles = require('./user_profile_controller.styl');


class UserProfileController extends BaseController {
  connectedCallback(){
    super.connectedCallback();

    console.log('user profile ctrl');
    this.html(template());
  }
  get routes(){
    let self = this;
    return {
      on(){
      },
      '$/'(){},
      '/profile'(){
      },
    }
  }
}

module.exports = customElements.define('user-profile-controller', UserProfileController);
