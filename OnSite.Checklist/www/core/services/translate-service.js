
(function () {
    'use strict';

    angular.module('checklists.core.services')
        .factory('TranslateService',[
            '$translate',
            '$translatePartialLoader',
            function (
                $translate,
                $translatePartialLoader) {

                var service = {

                    registerModule:function registerModule(module) {
                        var dirty = false;
                        if(angular.isString(module) && !$translatePartialLoader.isPartAvailable(module)){
                            $translatePartialLoader.addPart(module);
                        }
                    }
                };

                return service;
            }
        ]);
})();
