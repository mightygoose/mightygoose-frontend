const pry = require('pryjs');

const jackrabbit = require('jackrabbit');
const log = require('log-colors');
const spawn = require('co');
const qs = require('qs');
const _ = require('lodash');
const massive = require("massive");

const discogs_client = require('lib/discogs_client');
const postprocess = require('workers/items_postprocessor');

const discogs_album_restorer = new (require('lib/restorers/discogs')).AlbumRestorer();
const itunes_album_restorer  = new (require('lib/restorers/itunes')).AlbumRestorer();
const deezer_album_restorer  = new (require('lib/restorers/deezer')).AlbumRestorer();

const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];

const RABBITMQ_URL = process.env['RABBITMQ_URL'];
const RABBITMQ_CHANNEL = process.env['RABBITMQ_CHANNEL'];

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

    log.info(`got item #${item.sh_key}`);
    var processed_item = Object.assign({}, item);

    Object.assign(processed_item, {
      discogs_data: yield discogs_album_restorer.restore(processed_item)
    });

    /* think of something better here */
    Object.assign(processed_item, {
      original_title: processed_item.title,
    }, !processed_item.discogs_data ? {} : {
      title: processed_item.discogs_data.title
    });
    /* / */

    Object.assign(processed_item, {
      restorers_data: yield {
        itunes: itunes_album_restorer.restore(processed_item),
        deezer: deezer_album_restorer.restore(processed_item)
      }
    });

    Object.assign(processed_item, {
      badges: generate_badges(processed_item)
    });

    Object.assign(processed_item, {
      status: generate_status(processed_item)
    });

    Object.assign(processed_item, {
      item_table: generate_table_name(processed_item)
    });

    Object.assign(processed_item, {
      merged_tags: _.uniq(
        JSON.parse(processed_item.tags).concat((processed_item.discogs_data || {genre: []}).genre)
                                       .concat((processed_item.discogs_data || {style: []}).style)
      )
    });


    var query_string = generate_query_string(processed_item);

    if(process.env['NODE_ENV'] !== 'production'){
      log.info(query_string);
    } else {
      var query_result = yield new Promise((resolve) => {
        db.run(query_string, (err, items) => {
          if(err){ log.error(err); }
          log.info(`item added to table ${processed_item.item_table}`);
          resolve(items);
        });
      });
    }

    postprocess(Object.assign({}, processed_item));

  }).catch(e => log.error(e));
}

function generate_badges(item){
  var badges = JSON.parse(item['badges']);
  var discogs_data = item.discogs_data;
  if(!discogs_data){
    badges.push('discogs-no-results');
  } else {
    if(discogs_data.similarity === 1){
      badges.push('discogs-title-exact-match');
    } else {
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
      if(prepared_item_title === prepared_discogs_title){
        badges.push('discogs-title-match-after-clean');
      } else {
        badges.push('discogs-title-doesnt-match');
      }
    }
  }
  return badges;
}

function generate_status(item){
  if(~item.badges.indexOf('discogs-no-results') || item.discogs_data.similarity <= 0.5){
    return "bad";
  }
  return "good";
}

function generate_table_name(item){
  switch(true){
    case item.status === 'good':
    case item.restorers_data.itunes && item.restorers_data.itunes.similarity === 1:
    case item.restorers_data.deezer && item.restorers_data.deezer.similarity === 1:
      return 'items';
    default:
      return 'bad_items';
  }
}

function generate_query_string(item){

    var prepared = _.pick(Object.assign({}, item, {
      discogs: _.pick(item.discogs_data, [
        "id", "type", "resource_url", "similarity", "thumb", "country", "year"
      ]),
      sh_type: item.crawler_name,
      tags: item.merged_tags
    }, !item.restorers_data.itunes ? {} : {
      itunes: item.restorers_data.itunes,
    }, !item.restorers_data.deezer ? {} : {
      deezer: item.restorers_data.deezer,
    }), [
      "sh_key", "sh_type", "embed", "images", "title", "url",
      "badges", "discogs", "itunes", "deezer", "tags"
    ]);


    var data = _.reduce(prepared, (acc, value, key) => {
      acc.fields.push(`"${key}"`);
      acc.values.push(`'${(
        typeof value === 'string'
        ? value
        : JSON.stringify(value)
      ).replace(/'/ig, "''")}'`);
      return acc;
    }, { fields: [], values: [] })


    return `
      INSERT INTO ${item.item_table} (${data.fields.join(', ')})
      VALUES (${data.values.join(', ')});
    `;
}



