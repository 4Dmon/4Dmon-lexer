/*global describe, it, beforeEach */
/*jshint unused:false */

'use strict';

// -----------------------------------------------------
// Integration tests
// -----------------------------------------------------

var fs = require('fs')
  , expect = require('chai').expect
  , Lexer = require('../lib/4dmon-lexer.js').Lexer
  , fixtures = __dirname + '/fixtures'
  , fx_silly = fs.readFileSync(fixtures + '/silly_method.txt').toString();

describe.skip('4dmon-lexer', function() {
  var lexer;

  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should ...', function() {
    var toks = lexer.tokenize('C_BOOLEAN($0;$1;$truthy)');
    console.log(toks);
  });

  it('should be able to churn through a big ol method', function() {
    var toks = lexer.tokenize(fx_silly);
    console.log(toks);
  });

});
