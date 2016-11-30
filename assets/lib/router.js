import { fireEvent } from 'ascesis';

const default_options = {
  root: ''
}

export default class Router {
  get root(){
    return this._root || this.options.root;
  }
  set root(value){
    this._root = value;
  }

  get prev_path(){
    return this._prev_path;
  }
  set prev_path(value){
    this._prev_path = value;
  }

  get global_path(){
    return window.location.pathname;
  }

  get path(){
    return this.root_matches ? this.global_path.replace(this.root, '') : false;
  }

  get root_matches(){
    return this.global_path.indexOf(this.root) === 0;
  }

  constructor(options = {}){

    this.options = Object.assign({}, default_options, options);
    this.listeners = [];
    this.subrouters = [];

    console.log('router init', this.options);

    window.addEventListener('popstate', () => this.resolve());
    window.addEventListener('load', () => this.resolve());
    window.addEventListener('url-changed', () => this.resolve());
  }

  add(route = /(.*)/, callback = () => {}){
    this.listeners.push({ route, callback });
  }

  notify_listeners(){
    this.listeners.forEach(({ route, callback }) => {
      let match = this.path.match(route);
      if(match){
        callback.apply(this, match);
      }
    })
  }

  trigger(){
    fireEvent('url-changed', window);
  }

  resolve(){
    if(!this.root_matches || this.prev_path === this.path){
      return false;
    }
    //do not notify own listeners if subrouter matches root
    //should be checker here
    if(this.subrouters.length){
      for(let subrouter of this.subrouters){
        if(subrouter.root_matches && subrouter.prevent){
          return false;
        }
      }
    }
    this.prev_path = this.path;
    this.notify_listeners();
  }

  navigate(url){
    if(!this.root_matches){
      return false;
    }
    history.pushState(null, null, this.root + url);
    this.trigger('url-changed');
  }

  destroy(){
    this.listeners = [];
    window.removeEventListener('popstate', () => this.resolve());
    window.removeEventListener('load', () => this.resolve());
    window.removeEventListener('url-changed', (e) => this.resolve());
  }

  mount(path, router, prevent = true){
    router.root = this.root + path;
    router.prevent = prevent;
    this.subrouters.push(router);
  }

}