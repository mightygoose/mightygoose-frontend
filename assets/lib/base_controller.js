var BaseElement = require('lib/base_element');

module.exports = document.registerElement(
  'base-controller',
  {
    prototype: Object.create(
      BaseElement.prototype, {
      componentType: {value: "controller"},
      attributeChangedCallback: {value: function(name, previousValue, value) {
        console.log('base controller attributeChangedCallback');
        if (previousValue == null) {
          console.log('got a new attribute ', name, ' with value ', value);
        } else if (value == null) {
          console.log('somebody removed ', name, ' its value was ', previousValue);
        } else {
          console.log(name, ' changed from ', previousValue, ' to ', value);
        }
        this.attributeChange && this.attributeChange();
      }}
    })
  }
);
