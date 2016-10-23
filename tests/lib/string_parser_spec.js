const assert = require('assert');

const parser = require('lib/string_parser');

const cases = [
  //easy
  {
    structure: [
      {
        "type": "pattern",
        "value": "artist",
        "positions": []
      },
      {
        "type": "delimiter",
        "value": " - ",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "album",
        "positions": []

      },
      {
        "type": "delimiter",
        "value": " (",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "year",
        "positions": []

      },
      {
        "type": "delimiter",
        "value": ")",
        "positions": []
      }
    ],
    mask: '{artist} - {album} ({year})',
    strings: {
      'Artist - Album (2014)': {
        positions: [[6], [14], [20]],
        result: {
          artist: ['Artist'],
          album: ['Album'],
          year: ['2014']
        }
      },
      'Artist - Middle - Album (2014)': {
        positions: [[6, 15], [23], [29]],
        result: {
          artist: ['Artist', 'Artist - Middle'],
          album: ['Middle - Album', 'Album'],
          year: ['2014']
        }
      },
      'Ab - Cd - Ef - Gh - Ij (2014)': {
        positions: [[2, 7, 12, 17], [22], [28]],
        result: {
          artist: ['Ab', 'Ab - Cd', 'Ab - Cd - Ef', 'Ab - Cd - Ef - Gh'],
          album: ['Cd - Ef - Gh - Ij', 'Ef - Gh - Ij', 'Gh - Ij', 'Ij'],
          year: ['2014']
        }
      }
    }
  },
  {
    structure: [
      {
        "type": "pattern",
        "value": "artist",
        "positions": []
      },
      {
        "type": "delimiter",
        "value": " - ",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "album",
        "positions": []

      },
      {
        "type": "delimiter",
        "value": " - ",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "year",
        "positions": []

      }
    ],
    mask: '{artist} - {album} - {year}',
    strings: {
      'Artist - Album - 2014': {
        positions: [[6], [14]],
        result: {
          artist: ['Artist'],
          album: ['Album'],
          year: ['2014']
        }
      },
      'Artist - Middle - Album - 2014': {
        positions: [[6, 15], [15, 23]],
        result: {
          artist: ['Artist', 'Artist - Middle'],
          album: ['Middle', 'Middle - Album', 'Album'],
          year: ['Album - 2014', '2014']
        }
      },
    }
  },
  {
    structure: [
      {
        "type": "pattern",
        "value": "artist",
        "positions": []
      },
      {
        "type": "delimiter",
        "value": " - ",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "album",
        "positions": []

      },
      {
        "type": "delimiter",
        "value": " ",
        "positions": []

      },
      {
        "type": "pattern",
        "value": "year",
        "positions": []

      }
    ],
    mask: '{artist} - {album} {year}',
    strings: {
      'Artist - Album 2014': {
        positions: [[6], [14]],
        result: {
          artist: ['Artist'],
          album: ['Album'],
          year: ['2014']
        }
      },
      'Artist - Middle - Album 2014': {
        positions: [[6, 15], [23]],
        result: {
          artist: ['Artist', 'Artist - Middle'],
          album: ['Middle - Album', 'Album'],
          year: ['2014']
        }
      },
      'Ab - Cd - Ef - Gh - Ij 2014': {
        positions: [[2, 7, 12, 17], [22]],
        result: {
          artist: ['Ab', 'Ab - Cd', 'Ab - Cd - Ef', 'Ab - Cd - Ef - Gh'],
          album: ['Cd - Ef - Gh - Ij', 'Ef - Gh - Ij', 'Gh - Ij', 'Ij'],
          year: ['2014']
        }
      }
    }
  }
]


describe('StringParser Module', () => {
  cases.forEach((sample) => {
    describe(`${sample.mask}`, () => {
      var mask_structure = parser.parse_mask(sample.mask);
      it('Mask Parser', () => {
        assert.deepEqual(
          mask_structure,
          sample.structure.map((item) => Object.assign({}, item, {
            positions: []
          }))
        );
      });
      describe('Cases:', () => {
        Object.keys(sample.strings).forEach((string) => {
          describe(`${string}`, () => {
            var structure = parser.analyse_string(string, mask_structure);
            var result = parser.parse_string(string, sample.mask);
            it('String Analyser', () => {
              assert.deepEqual(
                structure.filter((item) => item.type === 'delimiter')
                         .map((item) => item.positions),
                sample['strings'][string]['positions']
              );
            });
            it('String Parser', () => {
              assert.deepEqual(result, sample['strings'][string]['result']);
            });
          });
        });
      });
    });
  });
});
