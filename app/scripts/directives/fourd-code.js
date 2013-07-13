angular.module('4dmonLexerApp')
  .directive('fourdCode', ['fourdLexer', function (fourdLexer) {
    'use strict';
    return {
      template: '<div class="fourd-code"></div>',
      replace: true,
      restrict: 'AE',
      scope: {
        code: '='
      },
      link: function postLink(scope, element) {

        var doTheTimeWarp = function(code) {
          try {
            var toks = fourdLexer.tokenize(code)
              , html = '';
            angular.forEach(toks, function(t) {
              if(t[0] === 'NEW_LINE') {
                html += '<br />';
              } else if(t[0] === 'WHITESPACE') {
                for(var i = t[1].length; i--;) {
                  html += '&nbsp';
                }
              } else {
                html += '<span class="tok fourd-'+t[0].toLowerCase()+'">'+t[1]+'</span>';
              }
            });
            element.html(html);
          } catch(err) {
            element.html(err);
          }
        };

        scope.$watch('code', doTheTimeWarp);

      }
    };
  }]);
