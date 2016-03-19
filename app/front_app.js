const path = require('path');
const koa = require('koa');
const serve = require('koa-serve');
const send = require('koa-send');

var front_app = koa();
var assets_dir = path.join(__dirname, '..', 'public');

front_app.use(serve('assets', assets_dir));
front_app.use(function *(){
  console.log('ask index');
  yield send(this, 'public/index.html');
});

module.exports = front_app;
