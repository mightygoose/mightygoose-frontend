const { BaseController } = require('ascesis');
const { Router } = require('ascesis/router');


module.exports = class RouterController extends BaseController {
  connectedCallback(){
    super.connectedCallback();
    this.router = new Router({ container: this, routes: this.routes || {} });

    this.trigger('subrouter-connected', this.router);

    this.on('subrouter-connected', ({ stopPropagation, eventData: subrouter }) => {
      stopPropagation();
      subrouter.resolve();
    });

  }

  disconnectedCallback(){
    super.disconnectedCallback();
    this.router.destroy();
  }

  get routes(){}
}
