
var _ = require('lodash');

/*
 * Edge order and orientation:
 *                                                        *
 *               +           +                            *
 *                    8.1                                 *
 *                                                        *
 *                4.0     5.0                             *
 *                                                        *
 *                    0.1                                 *
 *   +           +           +           +           +    *
 *        4.1         0.0         5.1         8.0         *
 *                                                        *
 *    11.1    3.1 3.0     1.0 1.1     9.1 9.0    11.0     *
 *                                                        *
 *        7.1         2.0         6.1        10.0         *
 *   +           +           +           +           +    *
 *                    2.1                                 *
 *                                                        *
 *                7.0     6.0                             *
 *                                                        *
 *                   10.1                                 *
 *               +           +                            *
 *                                                        *
 */

function Cube(options) {
  options = options || {};
  this.ep = _.clone(options.ep || Cube.Identity.ep);
  this.eo = _.clone(options.eo || Cube.Identity.eo);
  this.cp = _.clone(options.cp || Cube.Identity.cp);
  this.co = _.clone(options.co || Cube.Identity.co);
}

Cube.prototype.clone = function() {
  return new Cube({
    ep: this.ep,
    eo: this.eo,
    cp: this.cp,
    co: this.co
  });
};

/**
 * Apply the edge permutations and flips of other Cube to this Cube and return
 * the result as a new Cube. Do not modify this Cube.
 *
 * @param other
 * another Cube
 *
 * @return
 * a new Cube
 */
Cube.prototype.multiplyEdges = function(other) {
  var ep = [];
  var eo = [];
  _.each(EDGE_INDEX, function(index) {
    ep[index] = this.ep[EDGE_INDEX[other.ep[index]]];
    eo[index] = this.eo[EDGE_INDEX[other.ep[index]]] ^ other.eo[index];
  }.bind(this));
  return new Cube({
    ep: ep,
    eo: eo,
    cp: this.cp,
    co: this.co
  });
}

/**
 * Apply the corner permutations and twists of other Cube to this Cube and
 * return the result as a new Cube. Do not modify this Cube.
 *
 * @param other
 * another Cube
 *
 * @return
 * a new Cube
 */
Cube.prototype.multiplyCorners = function(other) {
  var cp = [];
  var co = [];
  _.each(CORNER_INDEX, function(index) {
    cp[index] =  this.cp[CORNER_INDEX[other.cp[index]]];
    co[index] = (this.co[CORNER_INDEX[other.cp[index]]] + other.co[index]) % 3;
  }.bind(this));
  return new Cube({
    ep: this.ep,
    eo: this.eo,
    cp: cp,
    co: co
  });
}

Cube.prototype.multiply = function(other) {
  return this.multiplyEdges(other).multiplyCorners(other);
};

var CENTERS = Cube.CENTERS = ['U', 'B', 'R', 'F', 'L', 'D'];
var CENTER_INDEX = Cube.CENTER_INDEX = _.zipObject(CENTERS, _.range(CENTERS.length));
var EDGES = Cube.EDGES = ['UB', 'UR', 'UF', 'UL', 'BL', 'BR', 'FR', 'FL', 'DB', 'DR', 'DF', 'DL'];
var EDGE_INDEX = Cube.EDGE_INDEX = _.zipObject(EDGES, _.range(EDGES.length));
var CORNERS = Cube.CORNERS = ['ULB', 'UBR', 'URF', 'UFL', 'DBL', 'DRB', 'DFR', 'DLF'];
var CORNER_INDEX = Cube.CORNER_INDEX = _.zipObject(CORNERS, _.range(CORNERS.length));

var EDGE_SLOTS = Cube.EDGE_SLOTS = [
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
var CORNER_SLOTS = Cube.CORNER_SLOTS = [
    [12, 11,  6],
    [14,  8, 15],
    [38, 39, 47],
    [36, 45, 35],
    [20,  0,  9],
    [18, 17,  2],
    [42, 53, 41],
    [44, 33, 51]
];
var CENTER_SLOTS = Cube.CENTER_SLOTS = [25, 4, 28, 49, 22, 31];

var COLORS = Cube.COLORS = {
  U: 'w',
  B: 'b',
  R: 'r',
  F: 'g',
  L: 'o',
  D: 'y'
};

Cube.Identity = new Cube({
  ep: EDGES,
  eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  cp: CORNERS,
  co: [0, 0, 0, 0, 0, 0, 0, 0]
});

Cube.U = new Cube({
  ep: ['UL', 'UB', 'UR', 'UF', 'BL', 'BR', 'FR', 'FL', 'DB', 'DR', 'DF', 'DL'],
  eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  cp: ['UFL', 'ULB', 'UBR', 'URF', 'DBL', 'DRB', 'DFR', 'DLF'],
  co: [0, 0, 0, 0, 0, 0, 0, 0]
});
Cube.U2 = Cube.U.multiply(Cube.U);
Cube["U'"] = Cube.U2.multiply(Cube.U);

Cube.B = new Cube({
  ep: ['BR', 'UR', 'UF', 'UL', 'UB', 'DB', 'FR', 'FL', 'BL', 'DR', 'DF', 'DL'],
  eo: [   1,    0,    0,    0,    1,    1,    0,    0,    1,    0,    0,    0],
  cp: ['UBR', 'DRB', 'URF', 'UFL', 'ULB', 'DBL', 'DFR', 'DLF'],
  co: [    1,     2,     0,     0,     2,     1,     0,     0]
});
Cube.B2 = Cube.B.multiply(Cube.B);
Cube["B'"] = Cube.B2.multiply(Cube.B);

Cube.R = new Cube({
  ep: ['UB', 'FR', 'UF', 'UL', 'BL', 'UR', 'DR', 'FL', 'DB', 'BR', 'DF', 'DL'],
  eo: [   0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
  cp: ['ULB', 'URF', 'DFR', 'UFL', 'DBL', 'UBR', 'DRB', 'DLF'],
  co: [    0,     1,     2,     0,     0,     2,     1,     0]
});
Cube.R2 = Cube.R.multiply(Cube.R);
Cube["R'"] = Cube.R2.multiply(Cube.R);

Cube.F = new Cube({
  ep: ['UB', 'UR', 'FL', 'UL', 'BL', 'BR', 'UF', 'DF', 'DB', 'DR', 'FR', 'DL'],
  eo: [   0,    0,    1,    0,    0,    0,    1,    1,    0,    0,    1,    0],
  cp: ['ULB', 'UBR', 'UFL', 'DLF', 'DBL', 'DRB', 'URF', 'DFR'],
  co: [    0,     0,     1,     2,     0,     0,     2,     1]
});
Cube.F2 = Cube.F.multiply(Cube.F);
Cube["F'"] = Cube.F2.multiply(Cube.F);

Cube.L = new Cube({
  ep: ['UB', 'UR', 'UF', 'BL', 'DL', 'BR', 'FR', 'UL', 'DB', 'DR', 'DF', 'FL'],
  eo: [   0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
  cp: ['DBL', 'UBR', 'URF', 'ULB', 'DLF', 'DRB', 'DFR', 'UFL'],
  co: [    2,     0,     0,     1,     1,     0,     0,     2]
});
Cube.L2 = Cube.L.multiply(Cube.L);
Cube["L'"] = Cube.L2.multiply(Cube.L);

Cube.D = new Cube({
  ep: ['UB', 'UR', 'UF', 'UL', 'BL', 'BR', 'FR', 'FL', 'DR', 'DF', 'DL', 'DB'],
  eo: [   0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],
  cp: ['ULB', 'UBR', 'URF', 'UFL', 'DRB', 'DFR', 'DLF', 'DBL'],
  co: [    0,     0,     0,     0,     0,     0,     0,     0]
});
Cube.D2 = Cube.D.multiply(Cube.D);
Cube["D'"] = Cube.D2.multiply(Cube.D);

module.exports = Cube;

