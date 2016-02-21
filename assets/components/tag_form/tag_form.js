const BaseComponent = require('lib/base_component');
const template = require('babel!template-string!./tag_form.html');
const styles = require('style!css!stylus!./tag_form.styl');
const tag_template = require('ejs!./tag.html');
const _ = require('lodash');
const Delegate = require('dom-delegate');

class TagForm extends BaseComponent {

  tags_to_show_generator(interval = 100){
    var self = this;
    function* gen(){
      yield 0;
      var counter = 0;
      while(true) {
        counter += interval;
        if(counter > self.tags.length){
          yield self.tags.length + 1;
        } else {
          yield counter;
        }
      }
    }
    var gen_instance = gen();
    var current_value = gen_instance.next().value;
    return function(increase){
      if(increase){
        current_value = gen_instance.next().value;
      }
      return current_value;
    }
  }

  show_more_tags(force){
    this.$search_by_letter.innerHTML = `
      #taglist li:nth-child(n+${this.tags_to_show(force)}) {
        display: none;
      }
    `;
  }

  show_all_tags(){
  }

  create() {
    this.tags = [];
    this.tags_to_show = this.tags_to_show_generator(50);

    var letters = ['all'].concat('abcdefghijklmnopqrstuvwxyz1234567890'.split(''));

    this.innerHTML = template({
      letters,
      each_letter(tpl){
        return _.reduce(letters, (accum, letter) => accum.concat(tpl(letter)), "");
      }
    });

    var tags_nodes = [];


    this.$tagbar = this.querySelector('.tag-bar');
    this.$taglist = this.querySelector('.tag-list');

    this.$search_query = this.querySelector('#search_query');
    this.$search_by_letter = this.querySelector('#search_by_letter');

    var delegate = new Delegate(this);

    delegate.on("click", ".tag-bar .tag-label", (event) => {
      event.preventDefault();
    });

    delegate.on("change", ".tag-block", (event, target) => {
      if(event.target.checked){
        this.$tagbar.appendChild(target);
      } else {
        this.$taglist.appendChild(target);
      }
    });

    delegate.on("change", ".letter_searcher", (event, target) => {
      var value = target.value;
      if(value === 'all'){
        if(this.querySelector('#tag_search_input').value === ''){
          this.show_more_tags();
        } else {
          this.$search_by_letter.innerHTML = ``;
        }
      } else {
        this.$search_by_letter.innerHTML = `
          #taglist li:not([data-search^="${value}"]) {
            display: none;
          }
        `;
      }
    });

    delegate.on("click", ".show-more-tags", (event, target) => {
      this.show_more_tags(true);
    });

    delegate.on("keyup", "#tag_search_input", (event) => {
      var filter = event.target.value;
      var show_all = this.querySelector('.letter_searcher[value="all"]').checked;
      if(filter === ''){
        if(show_all){
          this.show_more_tags();
        }
        this.$search_query.innerHTML = ``;
      } else {
        if(show_all){
          this.$search_by_letter.innerHTML = ``;
        }
        this.$search_query.innerHTML = `
          #taglist li:not([data-search*="${filter.toLowerCase()}"]) {
            display: none;
          }
        `;
      }
    });

    fetch("/api/tags")
    .then(response => response.json())
    .then((tags_data) => {
      this.tags = _.toPairs(tags_data);
      this.show_more_tags(true);
      this.$taglist.innerHTML = "";
      tags_nodes = [];
      var fragment = document.createDocumentFragment();
      _.each(this.tags, (value) => {
        var [key, count] = value;
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
