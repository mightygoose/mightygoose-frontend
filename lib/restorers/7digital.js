const S_DIGITAL_CONSUMER_KEY = process.env['S_DIGITAL_CONSUMER_KEY'];
const S_DIGITAL_CONSUMER_SECRET = process.env['S_DIGITAL_CONSUMER_SECRET'];

const api = require('7digital-api').configure({
  consumerkey: S_DIGITAL_CONSUMER_KEY,
  consumersecret: S_DIGITAL_CONSUMER_SECRET,
  defaultParams: {
    country: 'de'
  }
});

var releases = new api.Releases();

module.exports = (item) => {
  return new Promise((resolve, reject) => {
    releases.search({q: item.title}, (error, data) => {
      if(error){
        reject(error);
        return;
      }
      resolve(data);
    });
  })
  .then(data => data.searchResults.searchResult);
};
