const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./autocomplete.html');
const _ = require('lodash');

const horsey = require('horsey');
const horsey_styles = require('style!css!horsey/dist/horsey.css');
//const styles = require('./post.styl');

class Autocomplete extends BaseComponent {
  render(data){
  }
  create(){
    console.log('autocomplete created');
    this.html(template());
    var input = document.getElementById("myinput");
    horsey(input, {
      suggestions: _.debounce((value, done) => {
        if(value.length < 3){
          done([]);
          return;
        }
        fetch(`/api/search/autocomplete?q=${value}`)
        .then((response) => response.json())
        .then((response) => {
          return [].concat(
            response.tags_count
            ? {
              type: 'tags_suggestion',
              count: response.tags_count,
              autocomplete_value: value
            }
            : []
          ).concat(response.items)
        })
        .then(done)
      }, 300),
      render(li, suggestion) {
        if(suggestion.type === 'tags_suggestion'){
          li.innerHTML = `
            <span>tags contain ${suggestion.autocomplete_value} : ${suggestion.count}</span>
          `;
        } else {
          li.innerHTML = `
            <img class="autofruit" style="width: 20px; height: 20px;" src="${suggestion.image}" />
            <span>${suggestion.title}</span>
          `;
        }
      },
      limit: 20
    });
    input.addEventListener('horsey-selected', (event) => {
      //debugger;
    });
  }
}

module.exports = document.registerElement('mg-autocomplete', Autocomplete);
