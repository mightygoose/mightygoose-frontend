var fireEvent = require('lib/fire_event');

function createChildComponents(){
  return Object.create(Array.prototype, {
    querySelector: {value: function(selector){
      for(var index = 0; index < this.length; index++){
        if(this[index].matches(selector)){
          return this[index];
        }
      }
      return null;
    }},
    querySelectorAll: {value: function(selector){
      var output = [];
      for(var index = 0; index < this.length; index++){
        this[index].matches(selector) && output.push(this[index]);
      }
      return output;
    }}
  });
}

module.exports = document.registerElement(
  'base-element',
  {
    prototype: Object.create(
      HTMLElement.prototype, {
      scope: {value: {}},
      toggleHighlight: {value: function(){
        this.classList.toggle(this.componentType + '-highlighted');
      }},
      toggleHighlightAll: {value: function(){
        this.toggleHighlight();
        this.childComponents.forEach(function(child){
          console.log(child);
          child.toggleHighlightAll();
        });
      }},
      removeChildComponent: {value: function(childComponent){
        var index = this.childComponents.indexOf(childComponent);
        this.childComponents.splice(index, 1);
      }},
      createdCallback: {value: function() {
        //console.log('base element createdCallback');
        this.childComponents = createChildComponents();
        this.create && this.create();
      }},
      attachedCallback: {value: function() {
        //console.log('base element attachedCallback');
        var self = this;
        fireEvent('component-attached', this);
        this.addEventListener('component-attached', function(event){
          event.stopPropagation();
          event.target.parentComponent = self;
          self.childComponents.push(event.target);
        });
        this.attach && this.attach();
      }},
      detachedCallback: {value: function() {
        console.log('base element detachedCallback');
        this.parentComponent.removeChildComponent(this);
        this.detach && this.detach();
      }},
    })
  }
);
