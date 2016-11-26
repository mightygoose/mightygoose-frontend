const BaseComponent = require('ascesis').BaseComponent;

class ShortStat extends BaseComponent {
  create() {
    var $total_posts_count = this.querySelector("#total_posts_count");
    fetch("/api/stat")
    .then(function(response){
      return response.json();
    }).then(function(json) {
      $total_posts_count.innerHTML = json.count;
    });
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = customElements.define('short-stat', ShortStat);
