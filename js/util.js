
var _ = require('lodash');

var COLORS = {
  U: 'w',
  B: 'b',
  R: 'r',
  F: 'g',
  L: 'o',
  D: 'y'
};

function cubieColors(cubie) {
  _.each(COLORS, function(color, face) {
    cubie = cubie.replace(new RegExp(face, 'g'), color);
  });
  return cubie;
}

function rotateStr(str, offset) {
  offset = offset % str.length;
  if (offset === 0) { return str; }
  if (offset < 0) { offset += str.length; }
  return str.substring(str.length - offset, str.length) +
      str.substring(0, str.length - offset);
}

function tokenize(alg) {
  // strip spaces
  alg = alg.replace(/ /g, '');
  var i = 0;
  var tokens = [];
  while (i < alg.length) {
    var part = alg.substr(i, 2);
    if (/[UDLRFB][2']/.test(part)) {
      tokens.push(part);
      i += 2;
      continue;
    }
    part = alg.substr(i, 1);
    if (/[UDLRFB]/.test(part)) {
      tokens.push(part);
      i++;
      continue;
    }
    throw new Error('Malformed algorithm string');
  }
  return tokens;
}

module.exports = {
  cubieColors: cubieColors,
  rotateStr: rotateStr,
  tokenize: tokenize
};

