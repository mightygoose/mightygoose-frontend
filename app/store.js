"use strict"
const pry = require('pryjs');

const request = require('koa-request');
const qs = require('qs');
const _ = require('lodash');
const log = require('log-colors');
const cheerio = require('cheerio');
const massive = require("massive");
const btc = require('bloom-text-compare');


const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];

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
      var query_string = qs.stringify({
        'type' : 'album',
        'token' : DISCOGS_TOKEN
      });
      var url = 'https://api.discogs.com/database/search?' + query_string + '&q=' + encodeURI(item['title']);
      request({
        url: url,
        headers: {
          'User-Agent': 'request'
        }
      })((error, response) => resolve(response, error));
    }).then((response, error) => {
      var body = response.body;
      var status = "good";
      item['badges'] = JSON.parse(item['badges'])

      if (!error && response.statusCode == 200) {
        var results = JSON.parse(body)['results'];
        var discogs_data = results[0];
        if(results.length == 0 || !discogs_data){
            item['badges'].push('discogs-no-results');
            item['discogs'] = [];
            console.log(item['title'], item['badges']);
            return ["bad", item['badges']];
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
      }
      console.log(item['title'], item['badges']);
      return [status, item['badges']];
    });
  }
}

module.exports = Store;
