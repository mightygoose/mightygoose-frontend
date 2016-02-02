const BaseComponent = require('lib/base_component');
const template = require('ejs!./post.html');

class PostItem extends BaseComponent {
  render(data){
    this.innerHTML = template({post: data});
  }
  create(){
    console.log('post item created');
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('post-item', PostItem);
