"use strict"
const pry = require('pryjs');

const request = require('koa-request');
const qs = require('qs');
const _ = require('lodash');
const log = require('log-colors');


const DATA_HOST = "https://storage.scrapinghub.com";
const PROJECT_ID = process.env['PROJECT_ID'];
const API_KEY = process.env['STORAGE_KEY'];

const CONNECT_TIMEOUT = 200;
const REQUEST_TIMEOUT = 200;

class Store {
  constructor(){
    this.collection = [];
    this.tags = [];
  }

  update(){
    log.info('updating statistics');
    var query_string = qs.stringify({
      "apikey": API_KEY,
      "format": "json",
      "meta": ["_key"],
      "nodata": "1"
    }, { arrayFormat: 'repeat' });
    var filter_param = '%5B%22content%22%2C%22matches%22%2C%5B%22(zippyshare|mediafire|mega\.nz)%22%5D%5D';
    var url = `${DATA_HOST}/items/${PROJECT_ID}?${query_string}&filterany=${filter_param}`;

    return new Promise((resolve) => {
      request(url)((error, response) => resolve(response, error));
    }).then((response, error) => {
      this.collection = _.map(JSON.parse(response.body), item => item._key);
      log.info('statistics updated');
    });
  }

  update_tags(){
    log.info('updating tags');
    var query_string = qs.stringify({
      "apikey": API_KEY,
      "format": "csv",
      "fields": "tags",
      "include_headers": "0",
      "escape": " ",
      "quote": " "
    }, { arrayFormat: 'repeat' });
    var filter_param = '%5B%22content%22%2C%22matches%22%2C%5B%22(zippyshare|mediafire|mega\.nz)%22%5D%5D';
    var url = `${DATA_HOST}/items/${PROJECT_ID}?${query_string}&filterany=${filter_param}`

    return new Promise((resolve) => {
      request(url)((error, response) => resolve(response, error));
    }).then((response, error) => {
      this.tags = _.reduce(response.body.split('\n'), (result, value, key) => {
        if(value === ''){ return result; }
        try {
          var tags = JSON.parse(value);
        } catch(e) {
          log.error('error parsing line: ' + value);
        }
        _.each(tags, (value, key) => {
          var _key = key
                     //.toLowerCase()
                     .replace(/^\*+/, '').replace(/\*+$/, '')
                     .replace(/genre: /i, '')
                     .replace(/label: /i, '')
                     .replace(/country: /i, '')
                     //.replace('and', '&')
                     .replace(/^-/, '')
                     .replace(/^#/, '')
                     .replace(/^¬/, '')
                     .replace(/^=/, '')
                     .replace(/^\./, '')
                     .replace(/^\+/, '')
                     .replace(/^\[/, '').replace(/\]$/, '')
                     .replace(/^\s+/, '')
                     .replace(/\s{2,}/g, ' ')
          result[_key] = result[_key] || 0;
          result[_key]++;
        });
        return result;
      }, {});
      log.info('tags updated');
    });
  }

  get_random(){
    var random_post_key = _.sample(this.collection);

    var query_string = qs.stringify({
      "apikey": API_KEY,
      "format": "json",
      "meta": ["_key"]
    }, { arrayFormat: 'repeat' });

    var url = `${DATA_HOST}/items/${random_post_key}?${query_string}`;

    return request(url);
  }

  get_by_tags(tags){
    var query_string = qs.stringify({
      "apikey": API_KEY,
      "format": "json",
      "count": 100,
      "meta": ["_key"]
    }, { arrayFormat: 'repeat' });
    var filter_param = encodeURIComponent('["tags","matches",["' + _.map(tags, tag => {
      return tag
             .replace('*', '\\\\*')
             .replace("[", "\\\\[")
             .replace("]", "\\\\]")
             .replace("(", "\\\\(")
             .replace(")", "\\\\)")
             .replace(/\s{2,}/g, ' ')
    }).join('|') + '"]]');
    var file_hostings_param = '%5B%22content%22%2C%22matches%22%2C%5B%22(zippyshare|mediafire|mega\.nz)%22%5D%5D';
    var url = `${DATA_HOST}/items/${PROJECT_ID}?${query_string}&filterany=${filter_param}&filterany=${file_hostings_param}`;

    return request(url);
  }
}

module.exports = Store;
