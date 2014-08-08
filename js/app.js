
var $ = require('jquery');
var _ = require('lodash');
var d3 = require('d3');

var CENTERS = ['w', 'b', 'r', 'g', 'o', 'y'];
var CENTER_SLOTS = [25, 4, 28, 49, 22, 31];

var CORNERS = [
    'wob',
    'wbr',
    'wrg',
    'wgo',
    'ybo',
    'yrb',
    'ygr',
    'yog'
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

var EDGES = [
    'wb',
    'wr',
    'wg',
    'wo',
    'ob',
    'br',
    'rg',
    'go',
    'yb',
    'yr',
    'yg',
    'yo',
];
var EDGE_SLOTS = [
    [13,  7],
    [26, 27],
    [37, 46],
    [24, 23],
    [10,  3],
    [ 5, 16],
    [40, 50],
    [48, 34],
    [19,  1],
    [30, 29],
    [43, 52],
    [32, 21]
];

var oPadding = 5;
var cubieSize = 30;
var iPadding = 2;
var round = 3;

function rotateStr(str, offset) {
  offset = offset % str.length;
  if (offset === 0) { return str; }
  if (offset < 0) { offset += str.length; }
  return str.substring(str.length - offset, str.length) +
      str.substring(0, str.length - offset);
}

function showPuzzle(data, options) {
  options = _.defaults(options || {}, { showText: false });

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

function mutate(position, alg) {
  function copyCubie(dst, src, twist) {
    dst.id = src.id;
    dst.orientation = src.orientation + (twist || 0);
  }

  if (alg === 'U') {
    var newPosition = _.cloneDeep(position);
    copyCubie(newPosition.corners[0], position.corners[3]);
    copyCubie(newPosition.corners[1], position.corners[0]);
    copyCubie(newPosition.corners[2], position.corners[1]);
    copyCubie(newPosition.corners[3], position.corners[2]);
    copyCubie(newPosition.edges[0], position.edges[3]);
    copyCubie(newPosition.edges[1], position.edges[0]);
    copyCubie(newPosition.edges[2], position.edges[1]);
    copyCubie(newPosition.edges[3], position.edges[2]);
    return newPosition;
  } else if (alg === 'R') {
    var newPosition = _.cloneDeep(position);
    copyCubie(newPosition.corners[1], position.corners[2], 1);
    copyCubie(newPosition.corners[5], position.corners[1], -1);
    copyCubie(newPosition.corners[6], position.corners[5], 1);
    copyCubie(newPosition.corners[2], position.corners[6], -1);
    copyCubie(newPosition.edges[5], position.edges[1]);
    copyCubie(newPosition.edges[9], position.edges[5]);
    copyCubie(newPosition.edges[6], position.edges[9], 1);
    copyCubie(newPosition.edges[1], position.edges[6], 1);
    return newPosition;
  }

  return position;
}

function posToOrder(position) {
  var order = _.range(0, 54, 0);

  _.each(CENTERS, function(center, index) {
    order[CENTER_SLOTS[index]] = center;
  });

  _.each(position.corners, function(cornerSpec, index) {
    var corner = rotateStr(CORNERS[cornerSpec.id], cornerSpec.orientation);
    var slot = CORNER_SLOTS[index];
    _.each(slot, function(facelet, faceletIndex) {
      order[facelet] = corner[faceletIndex];
    });
  });

  _.each(position.edges, function(edgeSpec, index) {
    var edge = rotateStr(EDGES[edgeSpec.id], edgeSpec.orientation);
    var slot = EDGE_SLOTS[index];
    _.each(slot, function(facelet, faceletIndex) {
      order[facelet] = edge[faceletIndex];
    });
  });

  return order.join('');
}

$(document).ready(function() {

  var position = {
    corners: _.map(_.range(8), function (i) { return { id: i, orientation: 0 }; }),
    edges: _.map(_.range(12), function (i) { return { id: i, orientation: 0 }; })
  };
  position = mutate(position, 'U');
  position = mutate(position, 'R');

  var order = posToOrder(position);

  var layout = [
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
  var cols = layout[0].length;
  var rows = layout.length;
  var layoutData = _.values(_.reduce(layout.join(''), function(memo, cell, index) {
    if (cell === ' ') { return memo; }
    memo.data[index] = {
      orderIndex: memo.orderIndex,
      color: order[memo.orderIndex],
      x: index % cols,
      y: Math.floor(index / cols)
    };
    memo.orderIndex++
    return memo;
  }, { orderIndex: 0, data: {} }).data);

  showPuzzle(layoutData /* , { showText: true } */);

});

