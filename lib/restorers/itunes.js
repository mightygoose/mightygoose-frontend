const request = require('request');

const URL_BASE = 'https://itunes.apple.com/search?entity=album';

module.exports = (item) => {
  return new Promise((resolve, reject) => {
    var title = item.title.replace(/ /ig, '+');
    request(`${URL_BASE}&term=${title}`, (error, header, response) => {
      if(error){
        reject(error);
        return;
      }
      resolve(response);
    });
  })
  .then(response => JSON.parse(response))
  .then(response => response.results);
};



