const training_data = [{"string":"Album","data":{},"mask":"{album}"},{"string":"Artist - Album (2014)","data":{},"mask":"{artist} - {album} ({year})"},{"string":"Artist - Middle - Album (2014)","data":{},"mask":"{artist} - {album} ({year})"},{"string":"Ab - Cd - Ef - Gh - Ij (2014)","data":{},"mask":"{artist} - {album} ({year})"},{"string":"Album 2014","data":{},"mask":"{artist} - {album} ({year})"},{"string":"Artist - Album 2014","data":{},"mask":"{artist} - {album} ({year})"},{"string":"Artist - Album - 2014","data":{},"mask":"{artist} - {album} - {year}"},{"string":"Artist - Middle - Album - 2014","data":{},"mask":"{artist} - {album} - {year}"},{"string":"Artist - Middle - Foobar - Barbaz - 2014","data":{},"mask":"{artist} - {album} - {year}"},{"string":"Artist - Album 2014","data":{},"mask":"{artist} - {album} {year}"},{"string":"Artist - Middle - Album 2014","data":{},"mask":"{artist} - {album} {year}"},{"string":"Ab - Cd - Ef - Gh - Ij 2014","data":{},"mask":"{artist} - {album} {year}"},{"string":"2014 Artist - Album","data":{},"mask":"{year} {artist} - {album}"},{"string":"2014 Artist - Middle - Album","data":{},"mask":"{year} {artist} - {album}"},{"string":"2014 Ab - Cd - Ef - Gh - Ij","data":{},"mask":"{year} {artist} - {album}"}];




const db = require('lib/clients/db');
const parser = require('lib/string_parser');
const StringAnalyser = require('lib/string_analyser');
const spawn = require('co');
const fs = require('fs');
const _ = require('lodash');

const analyser = new StringAnalyser();

spawn(function*(){


  analyser.on('weights_updated', () => console.log('recalculated!!'));

  if(true){
    console.log('training manually');

    //training_data.slice().forEach((mask) => analyser.train(mask['string'], mask['data'], mask['mask']));

    analyser.train(training_data.slice().map(mask => [mask['string'], mask['data'], mask['mask']]))

    analyser.train('Some artist', {}, '{album}');
    analyser.train('Lorem Ipsu', {}, '{album}');
    analyser.train('Dolores Prodor', {}, '{album}');
    analyser.train('Braahms', {}, '{album}');
    analyser.train('Help me', {}, '{album}');

    analyser.train('The beatles - Foo bar', {}, '{artist} - {album}');
    analyser.train('The beatles - Bar rba', {}, '{artist} - {album}');
    analyser.train('Brahms - the best of', {}, '{artist} - {album}');
    analyser.train('Brahms - the very best of', {}, '{artist} - {album}');
    //analyser.train('Brahms - the super best of', {}, '{artist} - {album}');

    analyser.train('Brahms - the super best of (live) (2015)', {}, '{artist} - {album} ({format}) ({year})');
  }

  if(false){
    var masks = yield new Promise((resolve, reject) => {
      fs.readFile("data.json", (err, data) => {
        if(err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      });
    });

    console.log('training with data from file');

    var dd = new Date();
    analyser.train(masks.map(mask => [mask['string'], mask['data'], mask['mask']]));
    console.log((new Date() - dd) * 1000);
  }


  if(true){
    var db_client = yield db;
    console.log('querying');
    var query_string = `
      SELECT
          recognition_result->'title'->>'original_title'::text AS string,
          json_build_object(
              'year', recognition_result->'title'->>'year',
              'album', recognition_result->'title'->'album',
              'artist', recognition_result->'title'->'artist'
          ) AS data,
          recognition_result->'title'->>'mask'::text AS mask
      FROM recognition_masks
      ORDER BY id DESC
      LIMIT 2000
    `;
    var masks = yield new Promise((resolve) => db_client.run(query_string, (err, items) => {
      if(err){ console.log(err); }
      resolve(items);
    }));

    console.log('training with db');

    var dd = new Date();
    analyser.train(masks.map(mask => [mask['string'], mask['data'], mask['mask']]));
    //masks.forEach((mask) => {
      //setTimeout(function(){
        //analyser.train(mask['string'], mask['data'], mask['mask'])
      //}, _.random(0, 1000));
    //})
    console.log((new Date() - dd) * 1000);
  }

  console.log('trained');

  if(true){
    console.log('grabbing titles from db');
    var db_client = yield db;
    var titles_query_string = `
      SELECT title
      FROM bad_items
      ORDER BY random()
      LIMIT 5
    `;
    var titles = yield new Promise((resolve) => db_client.run(titles_query_string, (err, items) => {
      if(err){ console.log(err); }
      resolve(items);
    }));

    titles.forEach((item) => {
      console.log(item.title);
      console.log(analyser.classify_mask(item.title).slice(0,2));
      console.log('----------------');
    })

  }

  if(false){
    console.log('grabbing titles from file');
    var titles = yield new Promise((resolve, reject) => {
      fs.readFile("samples.json", (err, data) => {
        if(err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      });
    });
    titles.sort(() => .5 - Math.random()).slice(0, 5).forEach((item) => {
      console.log(item.title);
      console.log(analyser.classify_mask(item.title).slice(0,2));
      console.log('----------------');
    })
  }

  //var dd = new Date();
  //setTimeout(function(){
    //console.log(JSON.stringify(analyser.get_structure(), null, 2));
    //console.log((new Date() - dd) / 1000);
  //}, 1500);

  if(false){
    console.log(analyser.classify_mask('Beth Hart - Fooo bar Baz 1986').slice(0,3));
    console.log(analyser.classify_mask('Beth Hart - Fooo bar Baz [1986]').slice(0,3));
    console.log(analyser.classify_mask('Beth Hart').slice(0,3));
    console.log(analyser.classify_mask('Threefinger Beat Set Vol. 34 - Smog').slice(0,3));
    console.log(analyser.classify_mask('VA - Nu Deep Vol.1: For Shiny Lifestyle (2016)').slice(0,3));
    console.log(analyser.classify_mask('Uriah Heep - Salisbury ( 2CD Deluxe Edition) (1971 remastered 2016)').slice(0,3));
    console.log(analyser.classify_mask('Tidal Wave - Spider Spider: Best Of Tidal Wave 2007 (LOSSLESS)').slice(0,3));
    console.log(analyser.classify_mask('Dirkschneider - Live - Back To The Roots (2016)').slice(0,3));
  }

}).catch(e => console.log(e))

