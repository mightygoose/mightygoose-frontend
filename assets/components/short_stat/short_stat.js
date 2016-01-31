var base_component = require('lib/base_component');

module.exports = document.registerElement(
  'short-stat',
  {
    extends: 'div',
    prototype: Object.create(
      base_component.prototype, {
      create: {value: function() {
        var $total_posts_count = this.querySelector("#total_posts_count");
        fetch("/api/stat")
        .then(function(response){
          return response.json();
        }).then(function(json) {
          $total_posts_count.innerHTML = json.count;
        });
      }},
      attach: {value: function() {
      }},
      detach: {value: function() {
      }},
      attributeChange: {value: function(
        name, previousValue, value
      ) {
      }}
    })
  }
);
