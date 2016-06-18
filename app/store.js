"use strict"
const pry = require('pryjs');

const request = require('koa-request');
const _ = require('lodash');
const log = require('log-colors');
const jackrabbit = require('jackrabbit');
const massive = require("massive");


const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];

const RABBITMQ_URL = process.env['RABBITMQ_URL'];
const RABBITMQ_CHANNEL = process.env['RABBITMQ_CHANNEL'];

const DISCOGS_TOKEN = process.env['DISCOGS_TOKEN'];

const CONNECT_TIMEOUT = 200;
const REQUEST_TIMEOUT = 200;


class Store {
  constructor(){
    this.collection = [];
    this.tags = [];

    log.info('connecting to db');
    massive.connect({
      connectionString: `postgres://${DB_USER}:${DB_PASSWD}@${DB_HOST}/${DB_NAME}`
    }, (err, db) => {
      log.info('connected to db');
      this.db = db;
    });

    log.info('connecting to queue');
    this.queue = jackrabbit(RABBITMQ_URL)
    .on('connected', function() {
      log.info('connected to queue');
    })
    .on('error', function(err) {
      log.info('queue error: ', err);
    })
    .on('disconnected', function() {
      log.info('disconnected from queue');
    });
  }

  get_stat(){
    return new Promise((resolve) => {
      this.db.run("select count(*) from items", (err,stat) => {
        resolve(stat, err);
      });
    }).then((response, error) => {
      return response[0];
    });
  }

  get_random(){
    return new Promise((resolve) => {
      this.db.run("select * from items order by random() limit 1", (err,stat) => {
        resolve(stat, err);
      });
    }).then((response, error) => {
      return response;
    });
  }

  get_by_id(item_id){
    return new Promise((resolve) => {
      this.db.run("select * from items where id=$1", [item_id], (err,stat) => {
        resolve(stat, err);
      });
    }).then((response, error) => {
      return response;
    });
  }

  get_tags(){
    return new Promise((resolve) => {
      this.db.run("select tags from items", (err,stat) => {
        resolve(stat, err);
      });
    }).then((response, error) => {
      return  _.reduce(response, (result, item) => {
        _.each(item['tags'], (value) => {
          result[value] = result[value] || 0;
          result[value]++;
        });
        return result;
      }, {});
    });
  }

  get_by_tags(tags){
    return new Promise((resolve) => {
      var tags_str = _.map(tags, tag => `'${tag}'`).join(', ')
      var query = `SELECT * FROM items WHERE tags ?| array[${tags_str}]`;
      this.db.run(query, (err,items) => {
        resolve(items, err);
      });
    }).then((response, error) => {
      return response;
    });
  }

  get_discogs_info(discogs_object){
    return new Promise((resolve) => {
      var url = `${discogs_object.resource_url}?token=${DISCOGS_TOKEN}`;
      request({
        url: url,
        headers: {
          'User-Agent': 'request'
        }
      })((error, response) => resolve(response, error));
    }).then((response, error) => {
      return response.body;
    });
  }

  //upload post
  add_post(item){
    return new Promise((resolve) => {
      this.queue
        .default()
        .publish(item, { key: RABBITMQ_CHANNEL })
        .on('drain', () => resolve(true));
    }).then(() => {
      log.info(`${item.crawler_name} crawler item #${item.sh_key} added to queue`);
      return ["in_process", item['badges']];
    });
  }
}

module.exports = Store;
