const pry = require('pryjs');

const jackrabbit = require('jackrabbit');
const log = require('log-colors');
const spawn = require('co');
const qs = require('qs');
const request = require('request');
const btc = require('bloom-text-compare');
const cheerio = require('cheerio');
const _ = require('lodash');
const massive = require("massive");

const discogs_client = require('lib/discogs_client');

const discogs_album_restorer = new (require('lib/restorers/discogs')).AlbumRestorer();
const itunes_album_restorer  = new (require('lib/restorers/itunes')).AlbumRestorer();
const deezer_album_restorer  = new (require('lib/restorers/deezer')).AlbumRestorer();

const track_restorers = {
  itunes: new (require('lib/restorers/itunes')).TrackRestorer(),
  deezer: new (require('lib/restorers/deezer')).TrackRestorer()
}

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
    var original_title = item.title; //very bad
    var discogs_data = yield discogs_album_restorer.restore(item);
    var prepared_data = decorate_with_discogs_data(item, discogs_data); //side effect here

    var status = prepared_data[0];

    var table = "bad_items";
    if(status === "good"){
      var table = "items";
    }

    var additional_data = yield [
      yield itunes_album_restorer.restore(item),
      yield deezer_album_restorer.restore(item)
    ];
    var itunes_data = additional_data[0];
    var deezer_data = additional_data[1];

    var tracks;
    if(_.isNull(itunes_data) && _.isNull(deezer_data) && !_.isNull(discogs_data)){
      log.info(`restoring tracklist of item #${item.sh_key}`);
      var discogs_additional_data = yield discogs_client.get_info(discogs_data);
      var data = yield Object.keys(track_restorers).reduce((acc, provider) => {
        acc[provider] = discogs_additional_data.tracklist.map(track => {
          return track_restorers[provider].restore(track);
        });
        return acc;
      }, {});
      tracks = Object.keys(data).reduce((acc, provider) => {
        var list = data[provider].filter(item => !!item);
        if(list.length){
          (acc = acc || {})[provider] = list;
        }
        return acc;
      }, null);

      //process content
      var artist = discogs_additional_data.artist;
      var album = discogs_additional_data.title;
      var year = discogs_additional_data.year;
      var recognition_mask = {
        title: {
          mask: original_title.trim()
                              .toLowerCase()
                              .replace(album.toLowerCase(), '{album}')
                              .replace(artist.toLowerCase(), '{artist}')
                              .replace(year, '{year}'),
          original_title: original_title.trim(),
          artist: artist,
          album: album,
          year: year
        },
        tracklist: []
      }


      var content_chunks = JSON.parse(item.content).replace(/<.*?>/ig, '\n').split('\n').filter(chunk => chunk.length);

      var tracklist = discogs_additional_data.tracklist;
      var len = tracklist.length;
      recognition_mask.tracklist = (function ngram(input, acc){
        acc.push(input.slice(0, len));
        return input.length > len ? ngram(input.slice(1), acc) : acc;
      })(content_chunks, [])
      .reduce((acc, item) => {
        var matches_count = tracklist.reduce((acc, track, index) => {
          return acc + item.reduce((acc, gr) => acc + (~gr.indexOf(track.title) ? 1 : 0), 0);
        }, 0);
        if(matches_count >= (acc.matches_count || 0)){
          return {
            gram: item,
            matches_count: matches_count
          };
        }
        return acc;
      }, {}).gram
      .reduce((acc, item, index) => {
        var track = tracklist.find(track => ~item.indexOf(track.title));
        if(!track){ return acc; }
        var track_artist = track.artist;
        var track_title = track.title;
        var track_position = track.position;
        var track_duration = track.duration.length ? track.duration : null;
        var track_index = tracklist.findIndex(t => t.position === track.position) + 1;
        var track_position_leading_zero = /^\d+$/.test(track_position)
                                          ? (+(track_position) > 9 ? track_position : "0" + track_position)
                                          : null;
        return acc.concat({
          mask: item.trim()
                    .toLowerCase()
                    .replace(track_title.toLowerCase(), '{track_name}')
                    .replace(track_artist.toLowerCase(), '{artist}')
                    .replace(track_duration, '{duration}')
                    .replace(
                      new RegExp(`(^${track_position.toLowerCase()}|${track_position.toLowerCase()}$)`),
                      '{position}'
                    )
                    .replace(
                      new RegExp(`(^${track_position_leading_zero}|${track_position_leading_zero}$)`),
                      '{position:leading_zero}'
                    )
                    .replace(
                      new RegExp(`(^${track_index}|${track_index}$)`),
                      '{position:index}'
                    ),
          line_text: item,
          position: track_position,
          artist: track_artist,
          duration: track_duration,
          track_name: track_title,
          track_index: track_index
        });
      }, []);

      var recognition_rule_query_string = `
        INSERT
        INTO recognition_masks ("item_sh_key", "recognition_result")
        VALUES ('${item.sh_key}', '${JSON.stringify(recognition_mask).replace(/'/ig, "''")}');
      `;
      if(process.env['NODE_ENV'] !== 'production'){
        console.log(recognition_rule_query_string);
      } else {
        db.run(recognition_rule_query_string, (err, items) => {
          if(err){ log.error(err); }
          log.info(`recognition mask added for item #${item.sh_key}`);
        });
      }
    }

    var fields_string = [
      "sh_key", "sh_type", "badges", "discogs", "embed", "images", "tags", "title", "url"
    ]
    .concat(!_.isUndefined(itunes_data) ? "itunes" : [])
    .concat(!_.isUndefined(deezer_data) ? "deezer" : [])
    .concat(!_.isUndefined(tracks) ? "tracklist" : [])
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
    .concat(!_.isUndefined(tracks) ? JSON.stringify(tracks).replace(/'/ig, "''") : [])
    .map(value => `'${value}'`)
    .join(',');

    if(table === 'bad_items' && (itunes_data && itunes_data.similarity === 1) || (deezer_data && deezer_data.similarity === 1)){
      table = 'items';
    }

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
  }).catch(e => log.error(e));
}


function decorate_with_discogs_data(item, discogs_data){
  var status = "good";
  item['badges'] = JSON.parse(item['badges']);

  if(!discogs_data){
    item['badges'].push('discogs-no-results');
    item['discogs'] = [];
    return ["bad", item];
  }

  item['discogs'] = discogs_data;
  if(item['title'] === discogs_data['title'] || discogs_data.similarity === 1){
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
