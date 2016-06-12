const massive = require("massive");
const log = require('log-colors');
const spawn = require('lib/spawn');

const itunes_restorer = require('lib/restorers/itunes');
const s_digital_restorer = require('lib/restorers/7digital');

const DB_HOST = process.env['DB_HOST'];
const DB_PORT = process.env['DB_PORT'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWD = process.env['DB_PASSWD'];
const DB_NAME = process.env['DB_NAME'];

const TABLE = 'items';


var connect = () => {
  return new Promise((resolve, reject) => {
    massive.connect({
      connectionString: `postgres://${DB_USER}:${DB_PASSWD}@${DB_HOST}/${DB_NAME}`
    }, (err, data) => resolve(data));
  });
};

spawn(function*(){
  log.info('connecting to db');
  var db = yield connect();
  log.info('connected to db');

  var query = (q) => {
    return new Promise((resolve) => {
      db.run(q, (err,stat) => {
        resolve(stat, err);
      });
    })
  }

  var result = yield query(`select id from ${TABLE} where s_digital is null and itunes is null`);
  log.info(`processing ${result.length} items`);

  for(var item of result){
    try {
      var item_data = yield query(`select * from ${TABLE} where id = ${item.id}`);
      var restored_data = yield [
        yield itunes_restorer(item_data[0]),
        yield s_digital_restorer(item_data[0])
      ];

      var itunes_data = restored_data[0];
      var s_digital_data = restored_data[1];
      var values = [
        `itunes = '${JSON.stringify(itunes_data)}'`,
        `s_digital = '${JSON.stringify(s_digital_data)}'`
      ].join(', ');
      var query_text = `UPDATE ${TABLE} set ${values} WHERE id = ${item.id}`;
      yield query(query_text);
      log.info(`item #${item.id} updated`);
    } catch(e) {
      log.info(`could not process item #${item.id}`);
    }
  }

  process.exit(0);
});

