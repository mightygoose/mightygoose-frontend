const BaseComponent = require('lib/base_component');
const template = require('raw!./tag_form.html');
const styles = require('style!css!stylus!./tag_form.styl');
const tag_template = require('ejs!./tag.html');
const _ = require('lodash');
const Delegate = require('dom-delegate');

class TagForm extends BaseComponent {
  create() {
    this.innerHTML = template;
    var tags_nodes = [];

    this.$tagbar = this.querySelector('.tag-bar');
    this.$taglist = this.querySelector('.tag-list');

    var delegate = new Delegate(this);
    delegate.on("change", ".tag-block", (event, target) => {
      if(event.target.checked){
        this.$tagbar.appendChild(target);
      } else {
        this.$taglist.appendChild(target);
      }
    });
    delegate.on("keyup", "#tag_search_input", (event) => {
      var filter = event.target.value;
      _.each(this.$taglist.childNodes, (tag_block) => {
        if(filter === '' || ~tag_block.dataset.value.indexOf(filter)){
          tag_block.classList.remove('hidden');
        } else {
          tag_block.classList.add('hidden');
        }
      });
    });

    fetch("/api/tags")
    .then(response => response.json())
    .then((tags_data) => {
      this.$taglist.innerHTML = "";
      tags_nodes = [];
      var fragment = document.createDocumentFragment();
      _.each(tags_data, (count, key) => {
        var el = document.createElement("div");
        el.innerHTML = tag_template({count, key});
        var child_el = el.firstChild;
        tags_nodes.push(child_el);
        fragment.appendChild(child_el);
      });
      this.$taglist.appendChild(fragment);
    });
  }
  get_tags(){
    return _.map(this.$tagbar.querySelectorAll(".tag-block"), element => element.dataset.value);
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('tag-form', TagForm);
