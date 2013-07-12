/*global describe, it, beforeEach */
/*jshint unused:false */

'use strict';

var fs = require('fs')
  , expect = require('chai').expect
  , Lexer = require('../lib/4dmon-lexer.js').Lexer
  , fixtures = __dirname + '/fixtures'
  , fx_comments = fs.readFileSync(fixtures + '/comments.txt').toString()
  , fx_trailing_whitespace = fs
      .readFileSync(fixtures + '/trailing_whitespace.txt').toString();

describe('4dmon-lexer', function() {
  var lexer;

  beforeEach(function() {
    lexer = new Lexer();
  });

  it('should be able to cleanup input code', function() {
    var cleaned = lexer.clean(fx_trailing_whitespace);
    expect(cleaned)
        .to.equal([
          '// This method has lots of trailing whitespace',
          'C_BOOLEAN($0)',
          '$0 := True'
        ].join('\n\n'));
  });

  describe('token matchers', function() {
    // -----------------------------------------------------
    // These tests do not perform tokenize actions... just make search each
    // lexer.@Token() method recognizes what it should
    // -----------------------------------------------------

    beforeEach(function() {
      lexer.tokenize(); // Initializes lexer.tokens etc.
    });

    describe('identifier matching', function() {

      it('should recognize interprocess variables', function() {
        lexer.chunk = '<>my global \n';
        expect(lexer.identifierToken()).to.equal(11);
        expect(lexer.tokens[0][0]).to.equal('IDENTIFIER_GLOBAL');
      });

      it('should recognize local variables', function() {
        lexer.chunk = '$_my local_1 \n';
        expect(lexer.identifierToken()).to.equal(12);
        expect(lexer.tokens[0][0]).to.equal('IDENTIFIER_LOCAL');
      });

      it('should recognize process variables', function() {
        lexer.chunk = '_4processss var \n';
        expect(lexer.identifierToken()).to.equal(15);
        expect(lexer.tokens[0][0]).to.equal('IDENTIFIER');
      });

      it('should recognize identifiers with parens as methods', function() {
        lexer.chunk = 'awesome function ()';
        expect(lexer.identifierToken()).to.equal(16);
        expect(lexer.tokens[0][0]).to.equal('IDENTIFIER_INVOKED');
      });

      it('should recognize built in 4D Commands', function() {
        lexer.chunk = 'Abs';
        expect(lexer.reservedToken()).to.equal(3);
        expect(lexer.tokens[0][0]).to.equal('FOURD_COMMAND');
      });

      it('should case format built in 4D Commands', function() {
        lexer.chunk = 'aBoRt';
        lexer.reservedToken();
        expect(lexer.tokens[0][1]).to.equal('ABORT');
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
      lexer.chunk = '// hey this is a comment\n now this is code';
      expect(lexer.commentToken()).to.equal('// hey this is a comment'.length);
      expect(lexer.tokens[0][0]).to.equal('COMMENT');
    });

    it('should recognize new line tokens', function() {
      lexer.chunk = '\n\n\n';
      expect(lexer.lineToken()).to.equal(1);
      expect(lexer.tokens[0][0]).to.equal('NEW_LINE');
    });

    it('should recognize non-newline white space tokens', function() {
      lexer.chunk = '\t\t\n';
      expect(lexer.whitespaceToken()).to.equal(2);
      expect(lexer.tokens[0][0]).to.equal('WHITESPACE');
    });

    it('should recognize number tokens', function() {
      lexer.chunk = '462';
      expect(lexer.numberToken()).to.equal(3);
      expect(lexer.tokens[0][0]).to.equal('NUMBER');
    });

    it('should recognize string tokens', function() {
      lexer.chunk = '"Hey this is a simple string"';
      expect(lexer.stringToken())
          .to.equal('"Hey this is a simple string"'.length);
      expect(lexer.tokens[0][0]).to.equal('STRING');
    });

    describe('operator tokens recognition', function() {
      var ops = [
        '&', '|', // Logic Operators
        '+', '-', '*', '/', // Arithmatic Operators
        '<=', '>=', '<', '>', '=', '#' // Comparison Operators
      ];

      ops.forEach(function(op) {
        it('should recognize operator ' + op, function() {
          lexer.chunk = op;
          expect(lexer.operatorToken()).to.equal(op.length);
          var tok = lexer.tokens.pop();
          expect(tok[0]).to.equal('OPERATOR');
          expect(tok[1]).to.equal(op);
        });
      });

    });

  });

});
