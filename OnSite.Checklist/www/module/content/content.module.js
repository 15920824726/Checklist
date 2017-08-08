(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.content');
    
    angular.module('checklists.module.content')
    	.controller('contentController', [
    		'$scope',
			'$ionicSideMenuDelegate',
			'$rootScope',
			'$translate',
            'UserService',
			function(
				$scope,
				$ionicSideMenuDelegate,
				$rootScope,
                $translate,
                UserService) {


    	    			var _content = this;
				_content.title = $translate.instant('common.appName');
                _content.noItems = true;//一旦有操作 则关闭

                $rootScope.$on('currentList',function(event, data) {
                    if(data&&data.name){
                        _content.title = data.name;
                    } else {
                    		_content.title = $translate.instant('common.appName');
                    }
                    if(data) {
                        _content.noItems = false;
                    }
                });
                $rootScope.$on('pdfShow',function(event,data){
                    if(data){
                        _content.noItems = false;
                    }
                });
                function getUserInfo(){
                    UserService.getUserInfo().then(function(userInfo){
                        _content.userInfo = userInfo;
                    });
                }
                getUserInfo();
                $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams) {
                        if (fromState.name == 'setting') {
                            getUserInfo();
                        }
                    }
                );
			}
		]);        
})();