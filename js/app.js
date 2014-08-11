
var $ = require('jquery');
var _ = require('lodash');

var Util = require('./util');
var Cube = require('./cube');
var Layout = require('./layout');

$(document).ready(function() {
  var scramble = "B U2 B D2 B2 L2 U2 B2 R' B2 L' B2 D' B L2 U2 L2 F";

  var c = _.reduce(Util.tokenize(scramble), function(c, turn) {
    return c.multiply(Cube[turn]);
  }, new Cube());
  Layout.showPuzzle(Layout.cubeToLayout(c));
});

