//requirements
const Store = require('./app/store');
const koa = require('koa');
const route = require('koa-route');
const serve = require('koa-static');
const log = require('log-colors');

//code
var app = koa();
var collection = [];
var store = new Store();

store.update();
store.update_tags();

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


app.use(route.get('/api/stat', function *(){
  this.body = JSON.stringify({
    'count': store.collection.length
  });
}));

app.use(route.get('/api/tags', function *(){
  this.body = JSON.stringify(store.tags);
}));

app.use(route.get('/api/post/random', function *(){
  var response = yield store.get_random();
  this.body = response.body || [];
}));

app.use(route.get('/api/update_stat', function *(){
  yield store.update();
  this.body = JSON.stringify({
    'count': store.collection.length
  });
}));

app.use(route.get('/api/update_tags', function *(){
  yield store.update_tags();
  this.body = JSON.stringify(store.tags);
}));


//static
app.use(serve(__dirname + '/public'));


app.listen(process.env['PORT'] || 3000);
