const path = require('path');
const koa = require('koa');
const serve = require('koa-serve');
const log = require('log-colors');

var front_app = koa();
var assets_dir = path.join(__dirname, '..', 'public');

var __render = function(template, data){
  !data && (data = {});
  var template = require(template);
  return template(data);
}

var render;
if(process.env['NODE_ENV'] === 'production'){
  render = __render;
} else {
  render = function(template, data){
    var name = require.resolve(template);
    delete require.cache[name];
    return __render(template, data);
  }
}

front_app.use(serve('assets', assets_dir));
front_app.use(function *(){
  log.info('render index.html');
  this.body = render('../public/index.html', {});
});

module.exports = front_app;
