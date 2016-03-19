const path = require('path');
const koa = require('koa');
const serve = require('koa-serve');
const route = require('koa-route');
const log = require('log-colors');

const GA_TRACKING_CODE = process.env['GA_TRACKING_CODE'] || '';

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

front_app.use(route.get('/post/random', function *(post_id){
  log.info('render random post page');
  this.body = render('../public/index.html', {og_tags: "", GA_TRACKING_CODE});
}));

front_app.use(route.get('/post/:post_id', function *(post_id){
  log.info('render item');
  var response = yield store.get_by_id(post_id);
  var item_data = response[0];
  var og_tags = render('../public/item_og_tags.html', {
    album_title: item_data.title,
    description: item_data.tags.join(', '),
    image: item_data.images[0]
  });
  this.body = render('../public/index.html', {og_tags, GA_TRACKING_CODE});
}));

front_app.use(function *(){
  log.info('render default');
  this.body = render('../public/index.html', {og_tags: "", GA_TRACKING_CODE});
});

module.exports = front_app;
