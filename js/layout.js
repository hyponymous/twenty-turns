
var _ = require('lodash');
var d3 = require('d3');

var Util = require('./util');
var Cube = require('./cube');

var EDGE_SLOTS = [
    [13,  7],
    [26, 27],
    [37, 46],
    [24, 23],
    [ 3, 10],
    [ 5, 16],
    [50, 40],
    [48, 34],
    [19,  1],
    [30, 29],
    [43, 52],
    [32, 21]
];
var CORNER_SLOTS = [
    [12, 11,  6],
    [14,  8, 15],
    [38, 39, 47],
    [36, 45, 35],
    [20,  0,  9],
    [18, 17,  2],
    [42, 53, 41],
    [44, 33, 51]
];
var CENTER_SLOTS = [25, 4, 28, 49, 22, 31];

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
    var slot = CENTER_SLOTS[centerIndex];
    var pos = slotPos[slot];
    layout.push({ orderIndex: faceletIndex++, color: Util.cubieColors(facelet), x: pos[0], y: pos[1] });
  });

  _.each(Cube.EDGE_INDEX, function(edgeIndex) {
    var edge = Util.rotateStr(cube.ep[edgeIndex], cube.eo[edgeIndex]);
    _.each(Util.cubieColors(edge), function(color, colorIndex) {
      var slot = EDGE_SLOTS[edgeIndex][colorIndex];
      var pos = slotPos[slot];
      layout.push({ orderIndex: faceletIndex++, color: color, x: pos[0], y: pos[1] });
    });
  });

  _.each(Cube.CORNER_INDEX, function(cornerIndex) {
    var corner = Util.rotateStr(cube.cp[cornerIndex], cube.co[cornerIndex]);
    _.each(Util.cubieColors(corner), function(color, colorIndex) {
      var slot = CORNER_SLOTS[cornerIndex][colorIndex];
      var pos = slotPos[slot];
      layout.push({ orderIndex: faceletIndex++, color: color, x: pos[0], y: pos[1] });
    });
  });

  return layout;
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

module.exports = {
  cubeToLayout: cubeToLayout,
  showPuzzle: showPuzzle
};

