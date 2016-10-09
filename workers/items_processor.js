"use strict"

const pry = require('pryjs');

const log = require('log-colors');
const spawn = require('co');
const _ = require('lodash');

const discogs_client = require('lib/discogs_client');
const postprocess = require('workers/items_postprocessor');

const db_client = require('lib/clients/db');
const queue_client = require('lib/clients/queue');

const discogs_album_restorer = new (require('lib/restorers/discogs')).AlbumRestorer();
const itunes_album_restorer  = new (require('lib/restorers/itunes')).AlbumRestorer();
const deezer_album_restorer  = new (require('lib/restorers/deezer')).AlbumRestorer();

const RABBITMQ_CHANNEL = process.env['RABBITMQ_CHANNEL'];

class ItemsProcessor {

  constructor(){
    var self = this;

    self.postprocess = postprocess;

    spawn(function*(){

      var connections = yield [
        db_client,
        queue_client
      ];

      self.db = connections[0];
      self.queue = connections[1];


      self.queue.on('disconnected', () => {
        log.info('disconnected from queue. exiting.');
        process.exit(0);
      });

      self.queue
      .default()
      .queue({ name: RABBITMQ_CHANNEL })
      .consume(self.process_item.bind(self), { noAck: true });
    }).catch(e => log.error(`erroron initialisation. ${e}`));

    return this;
  }

  static generate_query_string(item){

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

  static generate_badges(item){
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

  static generate_status(item){
    if(~item.badges.indexOf('discogs-no-results') || item.discogs_data.similarity <= 0.5){
      return "bad";
    }
    return "good";
  }

  static generate_table_name(item){
    switch(true){
      case item.status === 'good':
      case item.restorers_data.itunes && item.restorers_data.itunes.similarity === 1:
      case item.restorers_data.deezer && item.restorers_data.deezer.similarity === 1:
        return 'items';
      default:
        return 'bad_items';
    }
  }

  static process_data(item){
    return spawn(function*(){

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
        badges: ItemsProcessor.generate_badges(processed_item)
      });

      Object.assign(processed_item, {
        status: ItemsProcessor.generate_status(processed_item)
      });

      Object.assign(processed_item, {
        item_table: ItemsProcessor.generate_table_name(processed_item)
      });

      Object.assign(processed_item, {
        merged_tags: _.uniq(
          JSON.parse(processed_item.tags).concat((processed_item.discogs_data || {genre: []}).genre)
                                         .concat((processed_item.discogs_data || {style: []}).style)
        )
      });

      return processed_item;

    }).catch(e => log.error(`error while processing item. ${e}`));
  }

  process_item(item) {
    return ItemsProcessor.process_data(item).then((processed_item) => {
      var query_string = ItemsProcessor.generate_query_string(processed_item);

      if(process.env['NODE_ENV'] !== 'production'){
        log.info(query_string);
      } else {
        new Promise((resolve) => {
          this.db.run(query_string, (err, items) => {
            if(err){ log.error(err); }
            log.info(`item added to table ${processed_item.item_table}`);
            resolve(items);
          });
        });
      }

      //should be event here
      this.postprocess(Object.assign({}, processed_item));
    }).catch(e => log.error(e))
  }
}


//run worker
if(process.env['NODE_ENV'] !== 'test'){
  new ItemsProcessor();
}


module.exports = ItemsProcessor;







