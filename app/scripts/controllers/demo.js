/*global angular */

'use strict';

angular.module('4dmonLexerApp')
  .controller('DemoCtrl', function($scope, fdLexer) {
    var exampleCode = [
      'if(False)',
      '    alert("I am the uncle of a monkey")',
      'endif'
    ].join('\n');

    $scope.code = {
      raw: exampleCode,
      formatted: exampleCode
      //formatted: fdLexer.tokenize(exampleCode)
    };

    $scope.$watch('code.raw', function(newRawCode) {
      //$scope.code.formatted = fdLexer.tokenize(newRawCode);
      $scope.code.formatted = newRawCode;
    });

  });

