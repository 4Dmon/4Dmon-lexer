/*global angular */

'use strict';

angular.module('4dmonLexerApp')
  .factory('fdLexer', function() {
    return new window.fourdmon.Lexer();
  });

