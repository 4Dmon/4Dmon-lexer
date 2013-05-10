/*jshint unused:false */

// [implement] Just ignore unused vars while things are
// stubbded [/implement]

/*
 * 4dmon-lexer
 * http://jtrussell-ivantage.github.io/4dmon-lexer
 *
 * Copyright (c) 2013 Justin Russell
 * Licensed under the MIT license.
 */

'use strict';

exports.Lexer = function() {

  var UNDEFINED // Leave this undefined

    // RegExps
    , COMMENT
    , DOUBLE_QUOTE_STRING
    , EOL_TRAILING_WHITESPACE
    , IDENTIFIER
    , IDENTIFIER_GLOBAL
    , IDENTIFIER_LOCAL
    , IDENTIFIER_INVOKED
    , NEW_LINE
    , NUMBER
    , TRAILING_WHITESPACE
    , WHITESPACE

    // Token Groups
    , COMPARE
    , LOGIC
    , MATH

    // Microsoft shenanigans
    , BOM = 65279;

  this.tokenize = function(code, opts) {
    var i = 0; // "Cursor" as we move through code block

    opts = opts || {};
    this.chunk = this.clean(code);
    this.tokens = []; // Parsed tokens, [['TYPE', value, location data], ...]
    this.ends = []; // stack for pairing tokens
    this.indent = opts.indent || 0;

    while(this.chunk) {
      // NOTE: the order below defines precedence
      i += this.commentToken()
          || this.lineToken()
          || this.whitespaceToken()
          || this.numberToken()
          || this.stringToken()
          || this.identifierToken();

      // [todo] Better error handling. For now just don't loop forever [/todo]
      if(isNaN(i)) { throw 'Could not parse: ' + this.chunk; }

      this.chunk = code.slice(i); // [todo] benchmark against substring? [/todo]
    }

    return this.tokens;
  };

  this.clean = function(code) {
    if(!code) { return ''; } // We can't do much with anything falsy
    if(code.charCodeAt(0) === BOM) { code = code.slice(1); }
    return code
      .replace(/\r/g, '') // Newline chars only kthanks!
      .replace(EOL_TRAILING_WHITESPACE, '') // 4D ignores ws at the end of lines
      .replace(TRAILING_WHITESPACE, '');
  };

  // Provide a way to add custom project methods, plugin methods, process vars,
  // etc. that we want to add to the grammar
  this.mixin = function(tag, toks) {
    toks = toks instanceof Array ? toks : [toks]; // Pass array or single item
  };

  // -----------------------------------------------------
  // Token chompers... these all take a look at `this.chunk` and see if it
  // starts with a token they recognize. If they find a token, the return its
  // *length* put a reference to that token on `this.tokens` stack by making a
  // call to `this.token`
  // -----------------------------------------------------

  this.basicToken = function(regexp, tag) {
    var tok = regexp.exec(this.chunk);
    if(!tok) { return UNDEFINED; }
    this.token(tag, tok[0], 0, tok[0].length);
    return tok[0].length;
  };

  this.identifierToken = function() {
    var identifier = this.basicToken(IDENTIFIER_GLOBAL, 'IDENTIFIER_GLOBAL')
      || this.basicToken(IDENTIFIER_LOCAL, 'IDENTIFIER_LOCAL')
      || this.basicToken(IDENTIFIER_INVOKED, 'IDENTIFIER_INVOKED');

    if(identifier) { return identifier; }

    identifier = IDENTIFIER.exec(this.chunk);
    if(!identifier) { return UNDEFINED; }

    // -----------------------------------------------------
    // [implement] Check with our recognized project methods, plugin methods,
    // etc. [/implement]
    // -----------------------------------------------------
    this.token('IDENTIFIER', identifier[0], 0, identifier[0].length);
    return identifier[0].length;
  };

  this.commentToken = function() {
    return this.basicToken(COMMENT, 'COMMENT');
  };

  this.whitespaceToken = function() {
    return this.basicToken(WHITESPACE, 'WHITESPACE');
  };

  this.lineToken = function() {
    return this.basicToken(NEW_LINE, 'NEW_LINE');
  };

  this.literalToken = function() {
    // [implement /]
  };

  this.numberToken = function() {
    // [todo] Does 4D do e.g. hex literals? I don't even know. [/todo]
    return this.basicToken(NUMBER, 'NUMBER');
  };

  this.stringToken = function() {
    return this.basicToken(DOUBLE_QUOTE_STRING, 'STRING');
  };

  // -----------------------------------------------------
  // Helpers
  // -----------------------------------------------------

  this.getLineAndColumnFromChunk = function(offset) {
    return {
      // [todo /]
    };
  };

  this.makeToken = function(tag, value, offsetInChunk, length) {
    var locationData = {};

    return [tag, value, locationData];
  };

  this.token = function(tag, value, offsetInChunk, length) {
    var token = this.makeToken(tag, value, offsetInChunk, length);
    this.tokens.push(token);
    return token;
  };

  // -----------------------------------------------------
  // Token matching Regexps
  // - - -
  // These describe our token types
  // -----------------------------------------------------
  IDENTIFIER = /^[\w]+(?: +\w+)*/;

  IDENTIFIER_GLOBAL = new RegExp('^<>' + IDENTIFIER.source.slice(1));

  IDENTIFIER_LOCAL = new RegExp('^\\$' + IDENTIFIER.source.slice(1));

  // We can tell something is a method is it's passed params... Still could be
  // a built in or a plugin method though. The 4D method editor 'cleans up' your
  // code by making sure there is a space between methods and opening parens...
  // we'll be a little generous and allow for any amount of (non-newline) space
  // between methods and parens.
  IDENTIFIER_INVOKED = new RegExp(IDENTIFIER.source + '(?=[^\\S\\n]*\\()');

  COMMENT = /^\/\/.*/; // Note we ignore the old "`" comments

  NEW_LINE = /^\n/;

  NUMBER = /^\d+/;

  DOUBLE_QUOTE_STRING = /^"[^\\"]*(?:\\.[^\\"]*)*"/;

  EOL_TRAILING_WHITESPACE = /[^\S\n]+(?=\n)/g;

  TRAILING_WHITESPACE = /\s+$/;

  WHITESPACE = /^[^\n\S]+/;


  // -----------------------------------------------------
  // Token literals and groups of token literals
  // -----------------------------------------------------
  LOGIC = ['&', '|'];

  MATH = ['+', '-', '*', '/'];

  COMPARE = ['>', '<', '<=', '>=', '='];

};
