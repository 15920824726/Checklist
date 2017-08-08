(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.dashboard');
    
    angular.module('checklists.module.dashboard')
    	.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
    				.state('dashboard', {
                		url: '/dashboard',
                        parent: 'list',
                        views: {
	                        'desktop@default': {
	                        	templateUrl: 'module/dashboard/views/dashboard.html'
	                        }
                        }  
                   	});
    			}
        ])
    	.controller('dashboardController', [
			function() {
				
			}
		]);        
})();