function fireEvent(eventName, target, eventData){
  target = target || document.body;
  var event;
  if(window.Event){
    event = new Event(eventName, {"bubbles":true, "cancelable":true});
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
  }
  event.eventData = eventData || null;
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

export class BaseController extends extend(HTMLElement) {
  get componentType(){ return 'controller'; }
}

export class BaseComponent extends extend(HTMLElement) {
  get componentType(){ return 'component'; }
}

export function extend(baseClass){
  return class extends baseClass {
    constructor(){
      super();
    }

    toggleHighlight(){
      this.classList.toggle(this.componentType + '-highlighted');
    }
    toggleHighlightAll(){
      this.toggleHighlight();
      this.childComponents.forEach(function(child){
        child.toggleHighlightAll();
      });
    }
    removeChildComponent(childComponent){
      var index = this.childComponents.indexOf(childComponent);
      this.childComponents.splice(index, 1);
    }
    trigger(eventName, eventData){
      fireEvent(eventName, this, eventData);
    }
    html(html_string){
      var fragment = document.createDocumentFragment();
      var temp_container = document.createElement('div');
      temp_container.innerHTML = html_string;
      while(temp_container.firstChild){
        fragment.appendChild(temp_container.firstChild);
      }
      this.innerHTML = "";
      this.appendChild(fragment);
    }

    connectedCallback(){
      this.childComponents = createChildComponents();
      this.trigger('component-attached');
      this.addEventListener('component-attached', (event) => {
        event.stopPropagation();
        event.target.parentComponent = this;
        this.childComponents.push(event.target);
      });
      super.connectedCallback && super.connectedCallback();
    }
    disconnectedCallback(){
      //remove event listener here
      this.parentComponent.removeChildComponent(this); //element shouldn't remove itself from parent
      super.disconnectedCallback && super.disconnectedCallback();
    }

    attributeChangedCallback(name, previousValue, value){
      this.attributeChange && this.attributeChange(name, previousValue, value);
    }
  }
}
