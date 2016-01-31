var base_component = require('lib/base_component');

module.exports = document.registerElement(
  'short-stat',
  {
    extends: 'div',
    prototype: Object.create(
      base_component.prototype, {
      created: {value: function() {
        console.log('stat');
      }},
      attached: {value: function() {
      }},
      detached: {value: function() {
      }},
      attributeChanged: {value: function(
        name, previousValue, value
      ) {
      }}
    })
  }
);
