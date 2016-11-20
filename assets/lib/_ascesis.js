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


export class BaseElement extends HTMLElement {
  constructor(){
    super();
  }

  //scope: {value: {}},
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

  createdCallback(){
    this.childComponents = createChildComponents();
    this.create && this.create();
  }
  attachedCallback(){
    var self = this;
    this.trigger('component-attached');
    this.addEventListener('component-attached', function(event){
      event.stopPropagation();
      event.target.parentComponent = self;
      self.childComponents.push(event.target);
    });
    this.attach && this.attach();
  }
  detachedCallback(){
    this.parentComponent.removeChildComponent(this); //element shouldn't remove itself from parent
    this.detach && this.detach();
  }
  attributeChangedCallback(){
    this.attributeChange && this.attributeChange(name, previousValue, value);
  }


  connectedCallback(){}
  disconnectedCallback(){}
  attributeChangedCallback(){}
}

export class BaseController extends BaseElement {
  constructor(){
    super();
  }
  get componentType(){ return 'controller'; }
  //createdCallback(){}
  //attachedCallback(){}
  //detachedCallback(){}
  //attributeChangedCallback(){}
}

export class BaseComponent extends BaseElement {
  constructor(){
    super();
  }
  get componentType(){ return 'component'; }
  //createdCallback(){}
  //attachedCallback(){}
  //detachedCallback(){}
  //attributeChangedCallback(){}
}
