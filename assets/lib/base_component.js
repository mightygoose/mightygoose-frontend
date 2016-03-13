var BaseElement = require('lib/base_element');

module.exports = document.registerElement(
  'base-component',
  {
    prototype: Object.create(
      BaseElement.prototype, {
      componentType: {value: "component"}
    })
  }
);
