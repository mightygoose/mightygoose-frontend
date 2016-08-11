var _ = require('lodash');


var masks = [
  "{artist} - {album} ({year})",
  //"{artist} - {album}",
]

//var title = "Artist - Name - Album (1989)";
var title = "Artist - Foo - Album (1989)";

var expected_output = [
  {
    artist: "Artist - Name",
    album: "Album",
    year: "1989"
  },
  {
    artist: "Artist",
    album: "Name - Album",
    year: "1989"
  },
  {
    artist: "Artist - Name",
    album: "Album (1989)",
  },
  {
    artist: "Artist",
    album: "Name - Album (1989)",
  },
];

var ts = +(new Date()) + "";

var prepared_masks = masks.map(
  mask => mask
          .replace(/(\{.*?\})/ig, "___DELIMITER_" + ts + "___$1___DELIMITER_" + ts + "___")
          .split("___DELIMITER_" + ts + "___")
          .filter(item => item !== '')
          .map(item => {
            if(/^\{.*?\}$/.test(item)){
              return {
                type: "pattern",
                field_name: item.match(/^\{(.*)?\}$/)[1]
              };
            }
            return {
              type: "delimiter",
              delimiter_value: item,
              is_start: mask.indexOf(item) === 0,
              is_end: mask.indexOf(item) === mask.length - 1,
            };
          })
)

var mask = prepared_masks[0];

var positions = mask.reduce((acc, item, index) => {
    //console.log(item);
  if(item.type === 'delimiter'){
    var positions = title.split(item.delimiter_value).slice(0, -1).reduce((acc, item, index) => {
      return acc.concat(item.length + (acc[acc.length - 1] || 0));
    }, []);
    switch(true){
      case !acc:
        case !positions.length:
        case item.is_start && positions[0] !== 0:
        case item.is_end && positions[positions.length - 1] !== (title.length - 1):
        case acc.length && positions[0] < acc[acc.length - 1].position:
        return false;
      default:
        //console.log(acc[acc.length - 1]);
        acc[acc.length - 1].positions.push(positions[0]);
        return acc.concat({item: item, positions: positions});
    }
  } else if(index === 0) {
    return acc.concat({item: item, positions: [0]});
  } else {
    return acc.concat({item: item, positions: []});
  }
}, []);

//var title_matches = prepared_masks[1].reduce((acc, item) => {
  //if(item.type === 'delimiter'){
    //if(~title.indexOf(item.delimiter_value)){
      //return true;
    //} else {
      //return false;
    //}
  //}
  //return acc;
//}, true);

console.log(positions);

//console.log(prepared_masks);
