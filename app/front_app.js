const path = require('path');
const koa = require('koa');
const serve = require('koa-serve');
const route = require('koa-route');
const log = require('log-colors');
const aws = require('aws-sdk');
const _ = require('lodash');
const fs = require('fs');

const { routes: app_routes } = require('config/routes');

const jsdom = require("jsdom");
const { Response } = require('node-fetch');
const { JSDOM } = jsdom;
const { Script } = require("vm");

const pry = require('pryjs');

const GA_TRACKING_CODE = process.env['GA_TRACKING_CODE'] || '';

const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
const S3_BUCKET = process.env['S3_BUCKET'];

const is_production = process.env['NODE_ENV'] === 'production';

const s3 = new aws.S3();


const front_app = koa();
const assets_dir = path.join(__dirname, '..', 'public');

const frontend_app = get_frontend_app();

function get_frontend_app(){
  return new Promise((resolve, reject) => {
    fs.readFile('./public/assets/js/application_server.js', (err, content) => {
      if(err){
        reject(err);
        return;
      }
      resolve(new Script(content.toString()));
    });
  });
}


var __render = function(template, data){
  var template = require(template);
  return template(data || {});
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

front_app.use(route.get('/sitemaps/:sitemap_file', function *(sitemap_file){
  log.info('render sitemap');
  var params = {Bucket: S3_BUCKET, Key: `${sitemap_file}`};
  var sitemap_content = yield new Promise((resolve, reject) => {
    s3.getObject(params, function(err, data) {
      if(err){
        reject(err);
        return;
      }
      resolve(data);
    });
  })
  this.body = sitemap_content.Body.toString();
}));

front_app.use(route.get('/metrics/:metric', function *(metric){
  this.set('Content-Type', 'image/png');
  this.body = '';
}));

front_app.use(route.get('/post/', function *(post_id){
  log.info('render random post page');
  this.body = render('../public/index.html', {
    GA_TRACKING_CODE,
    request_href: this.request.href
  });
}));

front_app.use(route.get(`${app_routes.posts_page.route_base}/:rest(.*)?`, function *(rest){
  log.info('render welcome page');

  const dom = new JSDOM(``, {
    runScripts: "dangerously",
    resources: "usable",
    url: this.request.href
  });

  const { window } = dom;
  const { document } = window;

  const $controller = document.createElement(app_routes.posts_page.controller);
  $controller.setAttribute('router-root', 'true');
  $controller.setAttribute('router-base', app_routes.posts_page.route_base);

  window.fetch = (url, request) => {
    return store.search(JSON.parse(request.body)).then((data) => {
      return new Response(JSON.stringify(data));
    });
  }

  document.addEventListener('subrouter-connected', (event) => {
    event.target.router.resolve();
  });

  const when_gallery_rendered = new Promise((resolve) => {
    document.addEventListener('posts-gallery-rendered', resolve);
  });

  document.body.appendChild($controller);

  dom.runVMScript(yield is_production ? frontend_app : get_frontend_app());

  const { target } = yield when_gallery_rendered;
  //should be more generic prerendered attrs setter
  target.setAttribute('tags-prerendered', 'true');

  const critical_styles = [].slice.apply(document.querySelectorAll('head style')).reduce((acc, $el) => {
    acc.appendChild($el);
    return acc;
  }, document.createElement('div')).innerHTML;

  $controller.removeAttribute('router-root');

  this.body = render('../public/index.html', {
    GA_TRACKING_CODE,
    request_href: this.request.href,
    critical_styles: critical_styles,
    content: $controller.outerHTML
  });
}));

front_app.use(route.get('/post/:post_id/:slug?', function *(post_id, slug){
  log.info('render item');
  var response = yield store.get_by_id(post_id);
  var item_data = response[0];
  var og_tags = render('../public/item_og_tags.html', {
    album_title: item_data.title,
    description: item_data.tags.join(', '),
    image: item_data.images[0]
  });
  var title_parts = item_data.title.split(' - ');
  var jsonld = render('../public/item_jsonld.html', {
    artist: title_parts[0],
    album: title_parts[1]
  });

  var type;
  if(!(item_data.deezer || item_data.itunes)){
    type = "discogs";
  } else if((item_data.deezer || {similarity: 0}).similarity >= (item_data.itunes || {similarity: 0}).similarity){
    type = "deezer";
  } else {
    type = "itunes";
  }

  var post_content = render('../public/post.html', _.assign({}, {
    main_image: item_data.images[0],
    tags_path: app_routes.posts_page.route_base,
    each(list, tpl){
      return _.reduce(list, (accum, item) => accum.concat(tpl(item)), "");
    },
    type: type,
    deezer: item_data.deezer,
    itunes: item_data.itunes,
    post_share_link: `${this.request.href}/post/${item_data.id}`
  }, item_data));
  var content = render('../public/random_post.html', {
    content: `
      <post-item discogs-link="${item_data.discogs && item_data.discogs.resource_url ? item_data.discogs.resource_url : 'false'}">
        ${post_content}
      </post-item>
    `
  });

  this.body = render('../public/index.html', {
    og_tags,
    jsonld,
    GA_TRACKING_CODE,
    request_href: this.request.href,
    title: item_data.title,
    content: `
      <random-post-controller router-base="post" prerendered="true" post_id="${item_data.id}" style="display: none;">
        ${content}
      </random-post-controller>
    `
  });
}));

front_app.use(function *(){
  log.info('render default');
  this.body = render('../public/index.html', {
    GA_TRACKING_CODE,
    request_href: this.request.href
  });
});

module.exports = front_app;
