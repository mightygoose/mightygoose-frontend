const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./tag_form.html');
const styles = require('./tag_form.styl');
const tag_template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./tag.html');
const _ = require('lodash');
const Delegate = require('dom-delegate');


class TagForm extends BaseComponent {

  create() {

    var letters = 'abcdefghijklmnopqrstuvwxyz1234567890';

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
    this.$tags_limiter = this.querySelector('#tags_limiter');

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
      this.$search_by_letter.filter(value);

      if(value === ' '){
        this.querySelector('.show-more-tags').classList.remove('hidden');
      } else {
        this.querySelector('.show-more-tags').classList.add('hidden');
      }

      if(value === ' ' && this.querySelector('#tag_search_input').value === ''){
        this.$tags_limiter.show_more_tags();
      } else {
        this.$tags_limiter.show_all_tags();
      }
    });

    delegate.on("click", ".show-more-tags", (event, target) => {
      this.$tags_limiter.show_more_tags(true);
    });

    delegate.on("keyup", "#tag_search_input", (event, target) => {
      var filter = target.value;
      this.$search_query.filter(filter === '' ? false : filter.toLowerCase());
      if(filter === '' && this.querySelector('.letter_searcher.all-tags').checked === true){
        this.$tags_limiter.show_more_tags();
      } else {
        this.$tags_limiter.show_all_tags();
      }
    });

    fetch("/api/tags")
    .then(response => response.json())
    .then((tags_data) => {
      this.tags = _.toPairs(tags_data);
      this.$tags_limiter.setAttribute('max', this.tags.length);
      this.$tags_limiter.show_more_tags(true);
      this.$taglist.innerHTML = "";
      tags_nodes = [];
      var fragment = document.createDocumentFragment();
      _.each(_.shuffle(this.tags), (value) => {
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
