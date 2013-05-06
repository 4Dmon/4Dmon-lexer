/*
 * 4dmon-lexer
 * http://jtrussell-ivantage.github.io/4dmon-lexer
 *
 * Copyright (c) 2013 Justin Russell
 * Licensed under the MIT license.
 */

'use strict';

exports.Lexer = function() {

  var tt // token types
    , tl; // token literals


  this.tokenize = function(code, opts) {
    var i = 0; // "Cursor" as we move through code block

    this.chunk = code;
    this.tokens = []; // List of parsed tokens, of the form ['TYPE', value, location data]
    this.ends = []; // stack for pairing tokens
    this.chunk = '';
    this.indent = opts.indent || 0;

    while(this.chunk) {
      i += this.identifierToken()
          || this.commentToken()
          || this.whitespaceToken()
          || this.numberToken()
          || this.stringToken();

      this.chunk = code.substring(i);
    }

    return this.tokens;
  };

  this.identifierToken = function() {
    /**/
  };

  this.commentToken = function() {
    /**/
  };

  this.whitespaceToken = function() {
    /**/
  };

  this.numberToken = function() {
    /**/
  };

  this.stringToken = function() {
    /**/
  };

  // -----------------------------------------------------
  // Token matching Regexps
  // - - -
  // These describe our token types
  // -----------------------------------------------------
  tt = {
    GLOBAL_IDENTIFIER: /^<>[\w]+(?: \w+)*/, // start with a nubmer?

    LOCAL_IDENTIFIER: /^\$[\w]+(?: \w+)*/, // start with a number?

    IDENTIFIER: /^[\w]+(?: \w+)*/, // start with a number?

    COMMENT: /^\/\/.*/, // Note we ignore the old "`" comments

    NUMBER: /^\d+/,

    DOUBLE_QUOTE_STRING: /^"[^\\"]*(?:\\.[^\\"]*)*"/,

    SINGE_QUOTE_STRING: /^'[^\\']*(?:\\.[^\\']*)*'/,

    WHITESPACE: /^[^\n\S]+/,
  };


  // -----------------------------------------------------
  // Token literals and groups of token literals
  // -----------------------------------------------------
  tl = {
    LOGIC: ['&', '|'],

    MATH: ['+', '-', '*', '/']
  };

};
