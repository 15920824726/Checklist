(function() {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module');
	angular.module('checklists.module')
    	.config(['$stateProvider', '$urlRouterProvider',
    		function ($stateProvider, $urlRouterProvider) {
        		$stateProvider
                	.state('default', {
                        abstract: true,
                        views: {
	                        'left': {
	                        	templateUrl: 'module/menu-left/views/menu-left.html',
                                controller: 'menuLeftController',
                                controllerAs: 'menu'
	                        },
	                        'content': {
	                            templateUrl: 'module/content/views/content.html',
		                        controller:'contentController',
                                controllerAs: 'content'
	                        },
	                        'right': {
	                        	templateUrl: 'module/menu-right/views/menu-right.html',
                                controller: 'menuRightController'
	                        }
                        }
                   });
    		}
    	]);
}());

