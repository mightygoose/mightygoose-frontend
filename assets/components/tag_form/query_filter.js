const BaseComponent = require('ascesis').BaseComponent;


class QueryFilter extends BaseComponent {
  filter(query){
    if(query === false){
      this.innerHTML = ``;
    } else {
      this.innerHTML = `#taglist li:not([data-search${this.getAttribute('operator') || '*'}="${query}"]){
          display: none;
      }`;
    }
  }
}
QueryFilter.extends = 'style';

module.exports = document.registerElement('query-filter', QueryFilter);
