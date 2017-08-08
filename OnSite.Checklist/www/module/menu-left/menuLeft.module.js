(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.menuLeft');
    
    angular.module('checklists.module.menuLeft')
        
        .controller('menuLeftController',['$translate',
            function ($translate) {
				var _menu = this;
                _menu.translation = {
                    items: $translate.instant('common.items')
                };
            }
        ]);

})();