const path = require('path');
const koa = require('koa');
const serve = require('koa-serve');
const route = require('koa-route');
const log = require('log-colors');
const aws = require('aws-sdk');
const _ = require('lodash');
const fs = require('fs');

const { routes: app_routes } = require('../config/routes');

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


function *render_component(request_url){

  const init_time = new Date();
  let fetch_time;

  //create dom
  const dom = new JSDOM(``, {
    runScripts: "dangerously",
    resources: "usable",
    url: request_url
  });

  const { window } = dom;
  const { document } = window;

  const after_dom_created = new Date();

  //mock fetch function
  window.fetch = (url, request) => {
    const start = new Date();
    return store.search(JSON.parse(request.body)).then((data) => {
      fetch_time = new Date() - start;
      return new Response(JSON.stringify(data));
    });
  }

  //create and set up controller
  const $controller = document.createElement(app_routes.posts_page.controller);

  /* communicate with controller */
  $controller.setAttribute('router-root', 'true');
  $controller.setAttribute('router-base', app_routes.posts_page.route_base);

  //resolve router after it connects to DOM
  document.addEventListener('subrouter-connected', (event) => {
    event.target.router.resolve();
  });

  /* / */

  const when_gallery_rendered = new Promise((resolve) => {
    document.addEventListener('posts-gallery-rendered', resolve);
  });

  //attach controller to the DOM
  document.body.appendChild($controller);

  const after_inserted = new Date();

  //execute script
  dom.runVMScript(yield is_production ? frontend_app : get_frontend_app());

  const after_application_run = new Date();

  //await for event
  const { target, eventData: { posts_data } } = yield when_gallery_rendered;

  const after_got_event = new Date();

  //we don't want to render it on frontend again
  target.setAttribute('tags-prerendered', 'true');

  //extract critical styles
  const critical_styles = [].slice.apply(document.querySelectorAll('head style')).reduce((acc, $el) => {
    acc.appendChild($el);
    return acc;
  }, document.createElement('div')).innerHTML;

  const after_styles_inserted = new Date();

  //our router will work as subrouter on frontend
  $controller.removeAttribute('router-root');

  //close window
  window.close();

  const finish_time = new Date();

  return {
    content: $controller.outerHTML,
    critical_styles: critical_styles,
    metrics: {
      'dom_creation': after_dom_created - init_time,
      'dom_insertion': after_inserted - after_dom_created,
      'application_run': after_application_run - after_inserted,
      'fetch_resorces': fetch_time,
      'await_event': after_got_event - after_application_run - fetch_time,
      'insert_styles': after_styles_inserted - after_got_event,
      'flushing': finish_time - after_styles_inserted,
      'total': finish_time - init_time
    }
  }
}


front_app.use(route.get(`${app_routes.posts_page.route_base}/:rest(.*)?`, function *(rest){
  log.info('render welcome page');

  let rendering_result = {};
  try {
    rendering_result = yield* render_component(this.request.href);
  } catch(e) {
    logger.error(`Could not render component. {e}`);
  }

  this.body = render('../public/index.html', {
    GA_TRACKING_CODE,
    request_href: this.request.href,
    critical_styles: rendering_result.critical_styles,
    content: rendering_result.content,
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
