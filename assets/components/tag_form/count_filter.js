const BaseComponent = require('ascesis').BaseComponent;


//needs to be refactored
//add initial value attribute
class CountFilter extends BaseComponent {

  get template_parts(){
    return [`#taglist li:nth-child(`, `){
        display: none;
    }`];
  }

  tags_to_show_generator(interval = 1){
    var self = this;
    function* gen(){
      yield 0;
      var counter = 0;
      while(true) {
        counter += interval;
        if(counter > self.getAttribute('max')){
          yield +self.getAttribute('max') + 1;
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

  show_more_tags(force){ //should be 2 methods: show_more and show_current_state
    this.innerHTML = `#taglist li:nth-child(n+${this.tags_to_show(force)}){
        display: none;
    }`;
  }

  show_all_tags(){
    this.innerHTML = ``;
  }

  create(){
    this.tags_to_show = this.tags_to_show_generator(+this.getAttribute('interval'));

    this.innerHTML = `#taglist li:nth-child(n+${this.tags_to_show()}){
        display: none;
    }`;
  }
}
CountFilter.extends = 'style';

module.exports = document.registerElement('count-filter', CountFilter);
