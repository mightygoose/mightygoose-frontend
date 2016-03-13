var BaseElement = require('lib/base_element');

module.exports = document.registerElement(
  'base-controller',
  {
    prototype: Object.create(
      BaseElement.prototype, {
      componentType: {value: "controller"}
    })
  }
);
