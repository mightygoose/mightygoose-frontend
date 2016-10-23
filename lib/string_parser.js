"use strict";


class string_parser {

  static positions(string, substring){
    var splitted = string.split(substring);
    if(splitted.length === 1){ return [] }
    return splitted.slice(0, -1).reduce(function(acc, chunk){
      var position = chunk.length;
      if(acc.length){
        position += acc[acc.length - 1] + substring.length;
      }
      return acc.concat(position);
    }, []);
  }

  static parse_mask(mask){

    var splitter = "||" + (+(new Date())) + "||";

    var structure = mask.replace(
      /\{(.+?)\}/ig, splitter + 'key:$1' + splitter
    )
    .split(splitter)
    .filter((item) => {
      return item !== '';
    })
    .reduce((acc, item) => {
      return acc.concat({
        type: item.indexOf('key:') === 0 ? 'pattern' : 'delimiter',
        value: item.replace('key:', ''),
        positions: []
      });
    }, []);

    return structure;
  }

  static analyse_string(string, structure){

    var regex = new RegExp(
      [].concat('^')
        .concat(structure.map((item) => {
          if(item.type === 'pattern'){
            return '(.*?)';
          } else {
            return item.value.replace(/(.)/ig, '[$1]');
          }
        }))
        .concat('$')
        .join('')
    );
    if(!regex.test(string)){ return false; }

    return structure.map((item, item_index) => {
      if(item.type === 'pattern'){
        return item;
      }

      return Object.assign({}, item, {
        positions: this.positions(string, item.value).filter((position, position_index) => {

          var prev_delimiter = structure[item_index - 2];
          var next_delimiter = structure[item_index + 2];

          //filter same positions forwards
          if(next_delimiter){
            var next_delimiter_positions = this.positions(string, next_delimiter.value);
            var next_delimiter_first_position = next_delimiter_positions[0];
            var next_delimiter_last_position = next_delimiter_positions[next_delimiter_positions.length - 1];
            if(next_delimiter.value !== item.value){
              if(~item.value.indexOf(next_delimiter.value)){
                return position <= next_delimiter_last_position;
              }
              return position <= next_delimiter_first_position;
            } else {
              if(item_index !== 0){
                return position <= next_delimiter_positions[position_index + 1];
              }
            }
          }
          //filter same positions backwards
          if(prev_delimiter){
            var prev_delimiter_positions = this.positions(string, prev_delimiter.value);
            var prev_delimiter_last_position = prev_delimiter_positions[prev_delimiter_positions.length - 1];
            if(prev_delimiter.value !== item.value){
              if(~prev_delimiter.value.indexOf(item.value)){
                return position > prev_delimiter_last_position + prev_delimiter.value.length;
              }
              return position >= prev_delimiter_last_position;
            } else {
              if(item_index !== structure.length - 1){
                return position >= prev_delimiter_positions[position_index - 1];
              }
            }
          }
          return true;
        })
      });
    });

  }

  static parse_string(string, mask){

    var structure = this.analyse_string(string, this.parse_mask(mask));

    return !structure ? false : structure.reduce((chunks, item, i) => {

      if(item.type !== 'pattern'){ return chunks; }

      var prev_item = structure[i - 1];
      var next_item = structure[i + 1];

      if(!prev_item && !next_item){
        chunks[item.value] = string;
      }
      if(!prev_item && next_item){
        chunks[item.value] = next_item.positions.map((n_pos) => {
          return string.slice(0, n_pos);
        });
      }
      if(prev_item && next_item){
        chunks[item.value] = prev_item.positions.reduce((acc, p_pos) => {
          return acc.concat(next_item.positions.filter((n_pos) => n_pos !== p_pos).map((n_pos) => {
            return string.slice(p_pos + prev_item.value.length, n_pos);
          }))
        }, []);
      }
      if(prev_item && !next_item){
        chunks[item.value] = prev_item.positions.map((p_pos) => {
          return string.slice(p_pos + prev_item.value.length);
        });
      }

      return chunks;
    }, {});
  }
}


module.exports = string_parser;
