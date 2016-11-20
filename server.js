if(process.env['NODE_ENV'] === 'production'){
  require('@risingstack/trace');
  require('newrelic');
}

const pry = require('pryjs');

//requirements
const koa = require('koa');
const route = require('koa-route');
const session = require('koa-session');
const compress = require('koa-compress');
const mount = require('koa-mount');

const front_app = require('./app/front_app');
const api_app = require('./app/api_app');
const user_app = require('./app/user_app');
const log = require('log-colors');

//code
var app = koa();


//response time
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

//compress
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

//api endpoints
app.use(mount('/api', api_app));

//user app
app.keys = ['grant', 'user'];
app.use(session(app));
app.use(mount('/user', user_app));

//static
app.use(mount('/', front_app));

app.listen(process.env['PORT'] || 3000);
