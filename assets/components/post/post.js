const BaseComponent = require('lib/base_component');
const template = require('ejs!./post.html');
const styles = require('style!css!stylus!./post.styl');

class PostItem extends BaseComponent {
  render(data){
    this.innerHTML = template(data);
  }
  create(){
    console.log('post item created');
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('post-item', PostItem);
