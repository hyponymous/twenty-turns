
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

var TURNS = {
  "U": {
    cornerIndices: [0, 1, 2, 3],
    cornerTwists: [0, 0, 0, 0],
    edgeIndices: [0, 1, 2, 3],
    edgeTwists: [0, 0, 0, 0],
  },
  "U'": {
    cornerIndices: [0, 3, 2, 1],
    cornerTwists: [0, 0, 0, 0],
    edgeIndices: [0, 3, 2, 1],
    edgeTwists: [0, 0, 0, 0],
  },
  "D": {
    cornerIndices: [4, 7, 6, 5],
    cornerTwists: [0, 0, 0, 0],
    edgeIndices: [8, 11, 10, 9],
    edgeTwists: [0, 0, 0, 0],
  },
  "D'": {
    cornerIndices: [4, 5, 6, 7],
    cornerTwists: [0, 0, 0, 0],
    edgeIndices: [8, 9, 10, 11],
    edgeTwists: [0, 0, 0, 0],
  },
  "R": {
    cornerIndices: [1, 5, 6, 2],
    cornerTwists: [1, -1, 1, -1],
    edgeIndices: [5, 9, 6, 1],
    edgeTwists: [0, 0, 1, 1],
  },
  "R'": {
    cornerIndices: [1, 2, 6, 5],
    cornerTwists: [1, -1, 1, -1],
    edgeIndices: [5, 1, 6, 9],
    edgeTwists: [0, 0, 1, 1],
  },
  "L": {
    cornerIndices: [0, 3, 7, 4],
    cornerTwists: [-1, 1, -1, 1],
    edgeIndices: [4, 3, 7, 11],
    edgeTwists: [1, 1, 0, 0],
  },
  "L'": {
    cornerIndices: [0, 4, 7, 3],
    cornerTwists: [-1, 1, -1, 1],
    edgeIndices: [4, 11, 7, 3],
    edgeTwists: [1, 1, 0, 0],
  },
  "F": {
    cornerIndices: [3, 2, 6, 7],
    cornerTwists: [-1, 1, -1, 1],
    edgeIndices: [2, 6, 10, 7],
    edgeTwists: [1, 0, 0, 1],
  },
  "F'": {
    cornerIndices: [3, 7, 6, 2],
    cornerTwists: [-1, 1, -1, 1],
    edgeIndices: [2, 7, 10, 6],
    edgeTwists: [0, 1, 1, 0],
  },
  "B": {
    cornerIndices: [0, 4, 5, 1],
    cornerTwists: [1, -1, 1, -1],
    edgeIndices: [0, 4, 8, 5],
    edgeTwists: [1, 0, 0, 1],
  },
  "B'": {
    cornerIndices: [0, 1, 5, 4],
    cornerTwists: [1, -1, 1, -1],
    edgeIndices: [0, 5, 8, 4],
    edgeTwists: [0, 1, 1, 0],
  }
};

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

function tokenize(alg) {
  // strip spaces
  alg = alg.replace(/ /g, '');
  var i = 0;
  var tokens = [];
  while (i < alg.length) {
    var part = alg.substr(i, 2);
    if (/[UDLRFB]2/.test(part)) {
      // push the single move twice
      part = alg.substr(i, 1);
      tokens.push(part);
      tokens.push(part);
      i += 2;
      continue;
    }
    if (/[UDLRFB]'/.test(part)) {
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

function derive(position, alg) {
  if (_.isString(alg)) { return derive(position, tokenize(alg)); }

  function copyCubie(dst, src, twist) {
    dst.id = src.id;
    dst.orientation = src.orientation + (twist || 0);
  }

  function copyCycle(dst, src, indices, twists) {
    for (var i = 0; i < indices.length; i++) {
      copyCubie(
          dst[indices[i]],
          src[indices[(i - 1 + indices.length) % indices.length]],
          twists[i]);
    }
  }

  _.each(alg, function(turn) {
    var newPosition = _.cloneDeep(position);
    copyCycle(
        newPosition.corners,
        position.corners,
        TURNS[turn].cornerIndices,
        TURNS[turn].cornerTwists);
    copyCycle(
        newPosition.edges,
        position.edges,
        TURNS[turn].edgeIndices,
        TURNS[turn].edgeTwists);
    position = newPosition;
  });

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
  position = derive(position, "B U2 B D2 B2 L2 U2 B2 R' B2 L' B2 D' B L2 U2 L2 F");

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

  showPuzzle(layoutData);

});

