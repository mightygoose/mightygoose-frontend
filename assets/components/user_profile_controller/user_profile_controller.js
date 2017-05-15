const BaseController = require('ascesis').BaseController;
const Router = require('router').Router;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./user_profile_controller.html');
const styles = require('./user_profile_controller.styl');


class UserProfileController extends BaseController {
  connectedCallback(){
    super.connectedCallback();

    this.router = new Router({ container: this, routes: this.routes });

    this.trigger('subrouter-connected', {
      router: this.router,
      base: this.attr('router-base')
    });

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
