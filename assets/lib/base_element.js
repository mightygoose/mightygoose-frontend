function fireEvent(eventName, target){
  target = target || document.body;
  var event;
  if(window.Event){
    event = new Event(eventName, {"bubbles":true, "cancelable":true});
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
  }
  target.dispatchEvent(event);
}

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
      trigger: {value: function(eventName){
        fireEvent(eventName, this);
      }},
      createdCallback: {value: function() {
        //console.log('base element createdCallback');
        this.childComponents = createChildComponents();
        this.create && this.create();
      }},
      attachedCallback: {value: function() {
        //console.log('base element attachedCallback');
        var self = this;
        this.trigger('component-attached');
        this.addEventListener('component-attached', function(event){
          event.stopPropagation();
          event.target.parentComponent = self;
          self.childComponents.push(event.target);
        });
        this.attach && this.attach();
      }},
      detachedCallback: {value: function() {
        //console.log('base element detachedCallback');
        this.parentComponent.removeChildComponent(this);
        this.detach && this.detach();
      }},
      attributeChangedCallback: {value: function(name, previousValue, value) {
        //console.log('base element attributeChangedCallback');
        this.attributeChange && this.attributeChange(name, previousValue, value);
      }},
    })
  }
);
