if(process.env['NODE_ENV'] === 'production'){
  require('newrelic');
}

const pry = require('pryjs');

//requirements
const koa = require('koa');
const request = require('koa-request');
const route = require('koa-route');
const body_parser = require('koa-body-parser');
const compress = require('koa-compress');
const mount = require('koa-mount');

const Store = require('./app/store');
const front_app = require('./app/front_app');
const log = require('log-colors');
const urllib = require('url');

//code
var app = koa();
var store = new Store();


app.use(body_parser());

app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  log.info(`${this.method} ${this.url} - ${ms} ms`);
});

//app endpoints

app.use(route.get('/api/stat', function *(){
  this.body = JSON.stringify(yield store.get_stat());
}));

app.use(route.get('/api/tags', function *(){
  var response = yield store.get_tags();
  this.body = response;
}));

app.use(route.get('/api/post/random', function *(){
  var response = yield store.get_random();
  this.body = response;
}));

app.use(route.get('/api/post/:post_id', function *(post_id){
  var response = yield store.get_by_id(post_id);
  this.body = response;
}));

app.use(route.post('/api/search/tags', function *(){
  var response = yield store.get_by_tags(this.request.body);
  this.body = response;
}));

app.use(route.post('/api/mixcloud/get_tracks', function *(){
  var url_params = urllib.parse(JSON.parse(this.request.body).url);
  var mix_key = url_params.pathname;
  if(!url_params.host.includes('mixcloud.com')){
    this.body = JSON.stringify({
      "error": "not a mixcloud link"
    });
    return false;
  }
  if(!/^\/.*\/.{1,}(\/)?/.test(mix_key)){
    this.body = JSON.stringify({
      "error": "link is not valid"
    });
    return false;
  }
  var options = {
    url: 'https://www.mixcloud.com/player/details/',
    qs: {
      "key": mix_key
    },
    headers: { 'User-Agent': this.request.header['user-agent'] }
  };
  var response = yield request(options);
  this.body = response.body || {};
}));

app.use(route.post('/api/discogs_info', function *(){
  var response = yield store.get_discogs_info(this.request.body);
  this.body = response;
}));


//static
app.use(mount('/', front_app));


app.listen(process.env['PORT'] || 3000);
