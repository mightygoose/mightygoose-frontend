"use strict"

const massive = require("massive");
const log = require('log-colors');

const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];


class DbClient {
  constructor(){
    return new Promise((resolve, reject) => {
      log.info('connecting to db');
      massive.connect({
        connectionString: `postgres://${DB_USER}:${DB_PASSWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      }, (err, _db) => {
        log.info('connected to db');
        resolve(_db);
      });
    });
  }
}

module.exports = new DbClient();
