const Delegate = require('dom-delegate');

const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./login_bar.html');
const styles = require('./login_bar.styl');


class LoginBar extends BaseComponent {
  create(){
    console.log('login bar created');
    this.render({});
    this.check_auth();

    let delegate = new Delegate(this);
    delegate.on('click', '.auth-button', () => this.login());
    delegate.on('click', '.user-logout-button', () => this.logout());

  }
  login(){
    let child_window = window.open('/user/connect/facebook',
                                   'Sharing', 'width=740,height=440'
    );

    let interval = setInterval(_ => {
      if(child_window.closed){
        clearInterval(interval);
        this.check_auth().then(() => {
          this.trigger('user-authorised');
        });
      }
    }, 500);
  }
  logout(){
    return fetch("/user/logout", {
      credentials: 'same-origin'
    })
    .then(() => this.check_auth());
  }
  check_auth(){
    return fetch("/user/info", {
      credentials: 'same-origin'
    })
    .then((response) => response.json())
    .then((user) => {
      this.render(user);
    });
  }
  render(user){
    this.html(template(user))
  }
}

module.exports = document.registerElement('login-bar', LoginBar);
