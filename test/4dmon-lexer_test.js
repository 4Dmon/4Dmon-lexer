/*global describe, it */

'use strict';

var fs = require('fs')
  , expect = require('chai').expect
  , Lexer = require('../lib/4dmon-lexer.js').Lexer
  , lexer = new Lexer()
  , fixtures = __dirname + '/fixtures'
  , fx_comments = fs.readFileSync(fixtures + '/comments.txt').toString()
  , fx_trailing_whitespace = fs
      .readFileSync(fixtures + '/trailing_whitespace.txt').toString();

describe('4dmon-lexer', function() {

  it.only('should be able to cleanup input code', function() {
    var cleaned = lexer.clean(fx_trailing_whitespace);
    expect(cleaned)
        .to.equal([
          '// This method has lots of trailing whitespace',
          'C_BOOLEAN($0)',
          '$0 := True'
        ].join('\n\n'));
  });
  
  it('should recognize identifier tokens', function() {
    // [todo /]
  });

  // NOTE: the tokenizer will just spin indefinitely if your code has any line
  // breaks until `lexer.lineToken` is filled out. You can test the other token
  // identifiers but you'll probably want to pass it only a single line of code.

  describe('identifier matching', function() {

    it('should recognize interprocess variables', function() {
      // [todo /]
    });

    it('should recognize local variables', function() {
      // [todo /]
    });

    it('should recognize built in 4D methods', function() {
      // [todo /]
    });

    it('should recognize project methods', function() {
      // [todo /]
    });

    it('should should recognize plugin methods', function() {
      // [todo /]
    });

    describe('with mixins', function() {
      it('should recogize methods added at runtime', function() {
        // [todo /]
      });
    });

  });

  it('should recognize comment tokens', function() {
    var tokens = lexer.tokenize(fx_comments);
    expect(tokens.length).to.equal(1);
    expect(tokens[0][0]).to.equal('COMMENT');
  });

  it('should recognize white space tokens', function() {
    // [todo /]
  });

  it('should recognize number tokens', function() {
    // [todo /]
  });

  it('should recognize string tokens', function() {
    // [todo /]
  });

});
