const BaseController = require('ascesis').BaseController;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./user_profile_controller.html');
const styles = require('./user_profile_controller.styl');


class UserProfileController extends BaseController {
  create(){
    console.log('user profile ctrl');
    this.html(template());
  }
  attach(){
  }
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('user-profile-controller', UserProfileController);
