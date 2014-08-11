
var $ = require('jquery');
var _ = require('lodash');
var d3 = require('d3');

var Cube = require('./cube');

function rotateStr(str, offset) {
  offset = offset % str.length;
  if (offset === 0) { return str; }
  if (offset < 0) { offset += str.length; }
  return str.substring(str.length - offset, str.length) +
      str.substring(0, str.length - offset);
}

function showPuzzle(data, options) {
  options = _.defaults(options || {}, {
    cubieSize: 30,
    iPadding: 2,
    oPadding: 5,
    round: 3,
    showText: false
  });
  var oPadding = options.oPadding;
  var cubieSize = options.cubieSize;
  var iPadding = options.iPadding;
  var round = options.round;

  var puzzle = d3.select('body').append('svg')
      .classed('twistypuzzle', true)
      .attr('width',  2 * oPadding + 12 * (cubieSize + iPadding) - iPadding)
      .attr('height', 2 * oPadding +  9 * (cubieSize + iPadding) - iPadding)
      ;

  puzzle.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', function(d) { return 'cubie cubie-' + d.color; })
      .attr('x', function(d) { return oPadding + (cubieSize + iPadding) * d.x; })
      .attr('y', function(d) { return oPadding + (cubieSize + iPadding) * d.y; })
      .attr('rx', round)
      .attr('ry', round)
      .attr('width', cubieSize)
      .attr('height', cubieSize)
      .attr('data-index', function(d) { return d.orderIndex; })
      ;

  if (options.showText) {
    puzzle.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', function(d) { return oPadding + (cubieSize + iPadding) * d.x + 15; })
        .attr('y', function(d) { return oPadding + (cubieSize + iPadding) * d.y + 22; })
        .attr('text-anchor', 'middle')
        .text(function(d) { return d.orderIndex; })
        ;
  }
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

function cubieColors(cubie) {
  _.each(Cube.COLORS, function(color, face) {
    cubie = cubie.replace(new RegExp(face, 'g'), color);
  });
  return cubie;
}

function cubeToLayout(cube) {
  var layoutDef = [
      '   ...      ',
      '   ...      ',
      '   ...      ',
      '............',
      '............',
      '............',
      '   ...      ',
      '   ...      ',
      '   ...      '
  ];
  // map slot index to x,y
  var slotPos = {};
  var index = 0;
  _.each(layoutDef, function(row, rowIndex) {
    _.each(row, function(char, charIndex) {
      if (char === '.') {
        slotPos[index++] = [charIndex, rowIndex];
      }
    })
  });

  var layout = [];
  var faceletIndex = 0;

  _.each(Cube.CENTER_INDEX, function(centerIndex, facelet) {
    var slot = Cube.CENTER_SLOTS[centerIndex];
    var pos = slotPos[slot];
    layout.push({ orderIndex: faceletIndex++, color: cubieColors(facelet), x: pos[0], y: pos[1] });
  });

  _.each(Cube.EDGE_INDEX, function(edgeIndex) {
    var edge = rotateStr(cube.ep[edgeIndex], cube.eo[edgeIndex]);
    _.each(cubieColors(edge), function(color, colorIndex) {
      var slot = Cube.EDGE_SLOTS[edgeIndex][colorIndex];
      var pos = slotPos[slot];
      layout.push({ orderIndex: faceletIndex++, color: color, x: pos[0], y: pos[1] });
    });
  });

  _.each(Cube.CORNER_INDEX, function(cornerIndex) {
    var corner = rotateStr(cube.cp[cornerIndex], cube.co[cornerIndex]);
    _.each(cubieColors(corner), function(color, colorIndex) {
      var slot = Cube.CORNER_SLOTS[cornerIndex][colorIndex];
      var pos = slotPos[slot];
      layout.push({ orderIndex: faceletIndex++, color: color, x: pos[0], y: pos[1] });
    });
  });

  return layout;
}

$(document).ready(function() {
  var scramble = "B U2 B D2 B2 L2 U2 B2 R' B2 L' B2 D' B L2 U2 L2 F";

  var c = _.reduce(tokenize(scramble), function(c, turn) {
    return c.multiply(Cube[turn]);
  }, new Cube());
  showPuzzle(cubeToLayout(c));
});

