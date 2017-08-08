(function() {
    'use strict';
    angular.module('checklists.core.filters')
        .filter('prefix', ['Constants',
            function (Constants) {
                return function (input, prefix) {
                    var output  = '';
                    if(!!prefix && !!input) {
                        output = Constants[prefix] + input;
                    }
                    return output;
                };
            }
        ]);
})();
