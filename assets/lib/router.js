import { fireEvent } from 'ascesis';

const default_options = {
  root: '',
  routes: {}
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

  constructor(options = {}, container = document){

    this.options = Object.assign({}, default_options, options);
    this.listeners = [];
    this.subrouters = [];
    this.container = container;

    Object.keys(this.options.routes).forEach((route) => {
      //add function should handle this
      this.add(route, this.options.routes[route]);
    });

    window.addEventListener('popstate', () => this.resolve());
    this.container.addEventListener('url-changed', () => this.resolve());

  }

  add(route = /(.*)/, callback = () => {}){
    this.listeners.push({ route: new RegExp(route), callback });
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
    fireEvent('url-changed', this.container);
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

  navigate(url, absolute = false, replace = false, silent = false){
    if(!this.root_matches || url === this.path){
      return false;
    }
    history[replace ? 'replaceState' : 'pushState'](null, null, this.root + url);
    !silent && this.trigger('url-changed');
  }

  destroy(){
    this.listeners = [];
    window.removeEventListener('popstate', () => this.resolve());
    this.container.removeEventListener('url-changed', () => this.resolve());
  }

  mount(path, router, prevent = false){
    router.root = this.root + path;
    router.prevent = prevent;
    this.subrouters.push(router);
  }

}
