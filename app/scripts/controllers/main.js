'use strict';

angular.module('4dmonLexerApp')
  .controller('MainCtrl', function ($scope) {
    $scope.features = [
      'Syntax highlighting for 4D code snippets',
      'Overview of process and inter-process variable usage',
      'Project method dependency graph',
      'Automated benchmarking'
    ];
  });
