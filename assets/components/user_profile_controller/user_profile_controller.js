const BaseController = require('ascesis').BaseController;
const Router = require('router').default;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./user_profile_controller.html');
const styles = require('./user_profile_controller.styl');


class UserProfileController extends BaseController {
  connectedCallback(){
    super.connectedCallback();

    console.log('user profile ctrl');
    this.html(template());
  }
  get router(){
    this._router || (this._router = new Router({ routes: this.routes }));
    return this._router;
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
