(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root.ascesis = factory());
    });
  } else {
    root.ascesis = factory();
  }
}(this, function(){

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

  var BaseElement = function(){};
  BaseElement.prototype = Object.create(HTMLElement.prototype, {
    scope: {value: {}},
    toggleHighlight: {value: function(){
      this.classList.toggle(this.componentType + '-highlighted');
    }},
    toggleHighlightAll: {value: function(){
      this.toggleHighlight();
      this.childComponents.forEach(function(child){
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
    html: {value: function(html_string){
      var fragment = document.createDocumentFragment();
      var temp_container = document.createElement('div');
      temp_container.innerHTML = html_string;
      while(temp_container.firstChild){
        fragment.appendChild(temp_container.firstChild);
      }
      this.innerHTML = "";
      this.appendChild(fragment);
    }},
    createdCallback: {value: function() {
      this.childComponents = createChildComponents();
      this.create && this.create();
    }},
    attachedCallback: {value: function() {
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
      this.parentComponent.removeChildComponent(this); //element shouldn't remove itself from parent
      this.detach && this.detach();
    }},
    attributeChangedCallback: {value: function(name, previousValue, value) {
      this.attributeChange && this.attributeChange(name, previousValue, value);
    }},
  });

  var BaseComponent = function(){};
  BaseComponent.prototype = Object.create(BaseElement.prototype, {
    componentType: {value: "component"}
  });

  var BaseController = function(){};
  BaseController.prototype = Object.create(BaseElement.prototype, {
    componentType: {value: "controller"}
  });

  return {
    BaseComponent: BaseComponent,
    BaseController: BaseController
  }
}));
