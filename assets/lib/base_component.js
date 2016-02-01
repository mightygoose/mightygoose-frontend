var fireEvent = require('lib/fire_event');

module.exports = document.registerElement(
  'base-component',
  {
    prototype: Object.create(
      HTMLElement.prototype, {
      componentType: {value: "component"},
      createdCallback: {value: function() {
        console.log('base component createdCallback');
        this.create && this.create();
      }},
      attachedCallback: {value: function() {
        console.log('base component attachedCallback');
        this.attach && this.attach();
        fireEvent('component-attached', this);
      }},
      detachedCallback: {value: function() {
        console.log('base component detachedCallback');
        this.detach && this.detach();
      }},
      attributeChangedCallback: {value: function(
        name, previousValue, value
      ) {
        console.log('base component attributeChangedCallback');
        if (previousValue == null) {
          console.log(
            'got a new attribute ', name,
            ' with value ', value
          );
        } else if (value == null) {
          console.log(
            'somebody removed ', name,
            ' its value was ', previousValue
          );
        } else {
          console.log(
            name,
            ' changed from ', previousValue,
            ' to ', value
          );
        }
        this.attributeChange && this.attributeChange();
      }}
    })
  }
);
