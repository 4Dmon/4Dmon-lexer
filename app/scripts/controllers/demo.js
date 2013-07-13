/*global angular */

'use strict';

angular.module('4dmonLexerApp')
  .controller('DemoCtrl', function($scope) {
    $scope.code = [
      '// Go ahead and write some 4D code goodness',
      'if($falsy)',
      '    alert("I am the uncle of a monkey")',
      'endif'
    ].join('\n');
  });

