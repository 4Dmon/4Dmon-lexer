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
    , GLOBAL_IDENTIFIER
    , IDENTIFIER
    , LOCAL_IDENTIFIER
    , NUMBER
    , TRAILING_WHITESPACE
    , WHITESPACE
    
    // Token Groups
    , LOGIC
    , MATH

    // Microsoft shenanigans
    , BOM = 65279;

  this.tokenize = function(code, opts) {
    var i = 0; // "Cursor" as we move through code block

    opts = opts || {};
    this.chunk = code;
    this.tokens = []; // Parsed tokens, [['TYPE', value, location data], ...]
    this.ends = []; // stack for pairing tokens
    this.indent = opts.indent || 0;

    while(this.chunk) {
      // NOTE: the order below defines precedence
      i += this.commentToken()
          || this.whitespaceToken()
          || this.numberToken()
          || this.stringToken()
          || this.identifierToken();

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

  this.identifierToken = function() {
    return UNDEFINED;
  };

  this.commentToken = function() {
    var tok = COMMENT.exec(this.chunk);
    if(!tok) { return UNDEFINED; }
    this.token('COMMENT', tok[0], 0, tok[0].length);
    return tok[0].length;
  };

  this.whitespaceToken = function() {
    return UNDEFINED;
  };

  this.lineToken = function() {
    return UNDEFINED;
  };

  this.numberToken = function() {
    return UNDEFINED;
  };

  this.stringToken = function() {
    return UNDEFINED;
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
  GLOBAL_IDENTIFIER = /^<>[\w]+(?: \w+)*/; // start with a nubmer?

  LOCAL_IDENTIFIER = /^\$[\w]+(?: \w+)*/; // start with a number?

  IDENTIFIER = /^[\w]+(?: \w+)*/; // start with a number?

  COMMENT = /^\/\/.*/; // Note we ignore the old "`" comments

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

};
