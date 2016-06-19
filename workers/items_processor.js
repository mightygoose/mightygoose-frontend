const pry = require('pryjs');

const jackrabbit = require('jackrabbit');
const log = require('log-colors');
const spawn = require('lib/spawn');
const qs = require('qs');
const request = require('request');
const btc = require('bloom-text-compare');
const cheerio = require('cheerio');
const _ = require('lodash');
const massive = require("massive");

const discogs_restorer = require('lib/restorers/discogs');
const itunes_restorer = require('lib/restorers/itunes');
const deezer_restorer = require('lib/restorers/deezer');


const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];

const RABBITMQ_URL = process.env['RABBITMQ_URL'];
const RABBITMQ_CHANNEL = process.env['RABBITMQ_CHANNEL'];

const DISCOGS_TOKEN = process.env['DISCOGS_TOKEN'];

var db;

spawn(function*(){

  var connections = yield Promise.all([
    //DB
    new Promise((resolve) => {
      log.info('connecting to db');
      massive.connect({
        connectionString: `postgres://${DB_USER}:${DB_PASSWD}@${DB_HOST}/${DB_NAME}`
      }, (err, _db) => {
        log.info('connected to db');
        resolve(_db);
      });
    }),
    //Q
    new Promise((resolve) => {
      log.info('connecting to queue');
      var queue = jackrabbit(RABBITMQ_URL)
      .on('connected', function() {
        log.info('connected to queue');
        resolve(queue);
      })
      .on('error', function(err) {
        log.info('queue error: ', err);
      })
      .on('disconnected', function() {
        log.info('disconnected from queue. exiting.');
        process.exit(0);
      });
    }),
  ]);

  db = connections[0];
  var queue = connections[1];

  queue
  .default()
  .queue({ name: RABBITMQ_CHANNEL })
  .consume(process_item, { noAck: true });
});

function process_item(item) {
  spawn(function*(){

    console.log(`got item #${item.sh_key}`);
    var discogs_data = yield discogs_restorer(item);
    var prepared_data = decorate_with_discogs_data(item, discogs_data);

    var status = prepared_data[0];

    var table = "bad_items";
    if(status === "good"){
      var table = "items";
    }

    var additional_data = yield [
      yield itunes_restorer(item),
      yield deezer_restorer(item)
    ];
    var itunes_data = additional_data[0];
    var deezer_data = additional_data[1];

    var fields_string = [
      "sh_key", "sh_type", "badges", "discogs", "embed", "images", "tags", "title", "url"
    ]
    .concat(!_.isUndefined(itunes_data) ? "itunes" : [])
    .concat(!_.isUndefined(deezer_data) ? "deezer" : [])
    .map(field => `"${field}"`)
    .join(',');

    var values_string = [
      item['sh_key'],
      item['crawler_name'],
      JSON.stringify(item['badges']),
      JSON.stringify(item['discogs']),
      item['embed'],
      item['images'].replace(/'/ig, "''"),
      JSON.stringify(item['tags']).replace(/'/ig, "''"),
      item['title'].replace(/'/ig, "''"),
      item['url']
    ]
    .concat(!_.isUndefined(itunes_data) ? JSON.stringify(itunes_data).replace(/'/ig, "''") : [])
    .concat(!_.isUndefined(deezer_data) ? JSON.stringify(deezer_data).replace(/'/ig, "''") : [])
    .map(value => `'${value}'`)
    .join(',');

    var query_string = `INSERT INTO ${table} (${fields_string}) VALUES (${values_string});`;

    if(process.env['NODE_ENV'] !== 'production'){
      log.info(query_string);
      return;
    }
    var query_result = yield new Promise((resolve) => {
      db.run(query_string, (err, items) => {
        if(err){ log.error(err); }
        log.info(`item added to table ${table}`);
        resolve([status, item['badges']]);
      });
    });
  });
}


function decorate_with_discogs_data(item, results){
  var status = "good";
  item['badges'] = JSON.parse(item['badges']);

  var discogs_data = results[0];
  if(results.length == 0 || !discogs_data){
    item['badges'].push('discogs-no-results');
    item['discogs'] = [];
    return ["bad", item];
  }

  item['discogs'] = discogs_data;
  if(item['title'] === discogs_data['title']){
    item['badges'].push('discogs-title-exact-match')
  }
  else {
    var prepared_item_title = _.trim(
      item['title']
      .replace(/\(\d{4}\)/ig, '')
      .replace(/\[\d{4}\]/ig, '')
      .replace(/\d{0,4}kbps/ig, '')
      .replace(/\(\)/ig, '')
      .replace(/\[\]/ig, '')
      .replace(/(\/.*)/ig, '')
      .replace(/[^0-9a-zA-Z ]+/ig, '')
      .toLowerCase());

    var prepared_discogs_title = discogs_data['title'].replace(/[^0-9a-zA-Z ]+/ig, '').toLowerCase();

    var title1 = item['title'].replace(/[^a-zA-Z0-9 ]/ig, '').toLowerCase();
    var title2 = item['discogs']['title'].replace(/[^a-zA-Z0-9 ]/ig, '').toLowerCase();

    var hash1 = btc.hash(title1.split(' '));
    var hash2 = btc.hash(title2.split(' '));

    var distance = btc.compare(hash1, hash2);

    item['discogs_title_similarity'] = distance;

    if(prepared_item_title === prepared_discogs_title){
      item['badges'].push('discogs-title-match-after-clean');
    } else if(distance > 0.5) {
      item['badges'].push('discogs-title-similarity-good');
    } else {
      item['badges'].push('discogs-title-doesnt-match');
      item['badges'].push('discogs-title-similarity-bad');
      status = "bad";
    }
  }

  if(!_.isEqual(item['discogs'], [])){
    item['title'] = item['discogs']['title'];
    item['tags'] = _.uniq(JSON.parse(item['tags']).concat(item['discogs']['genre']).concat(item['discogs']['style']));
    item['discogs'] = {
      "resource_url": item['discogs']['resource_url'],
      "type": item['discogs']['type'],
      "id": item['discogs']['id']
    };
  }
  return [status, item];

}
