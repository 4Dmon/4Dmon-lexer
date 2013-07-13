/*global angular */

'use strict';

angular.module('4dmonLexerApp')
  .factory('fourdLexer', function() {
    return new window.fourdmon.Lexer();
  });

