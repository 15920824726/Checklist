/**
 * Created by TWO on 3/9/2017.
 */
/**
 * Created by gam on 3/9/2017.
 */
(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.tabs');

    angular.module('checklists.module.tabs')
    		.config(['$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state('tabs', {
                        abstract: true,
                        parent: 'default',
                        views: {
                            'menu@default': {
                                templateUrl: 'module/menu-left-tabs/views/menu-left-tabs.html',
                                controller: 'menuLeftTabController as tab'
                            }
                        }
                    });
            }
        ])
        .controller('menuLeftTabController', [
                '$scope',
                '$rootScope',
                '$timeout',
                '$state',
                'IndexDBService',
                'TempDataService',
                'StorageService',
                'UserService',
                '$translate',
                function(
                    $scope,
                    $rootScope,
                    $timeout,
                    $state,
                    IndexDBService,
                    TempDataService,
                    StorageService,
                    UserService,
                    $translate) {
                    var DBService =  IndexDBService;
                    var dataService = TempDataService;
                    var storageService = StorageService;
                    
                    var storageType = storageService.getStore();
					var storageData = storageService.getItem(storageType, 'currentProject');
					if (storageData) {
						$rootScope.currentProject = storageData;
					}

                    var _tab = this;
                    _tab.showSearch = false;
                    _tab.disableSearch = false;
                    
                    $scope.$on('$stateChangeSuccess',
	                    function(event, toState, toParams, fromState, fromParams) {
	                        if (toState.name == 'lists' || toState.name == 'projects' || toState.name == 'items') {
	                        		_tab.disableSearch = false;
	                    		} else {
                                _tab.showSearch = false;
	                    			_tab.disableSearch = true;
	                    		}
	                    }
	                );

                    _tab.translation = {
                        search: $translate.instant('common.search')
                    };
                    var _menu = $scope.$parent.menu;

                    $rootScope.$on('$stateChangeSuccess',
                        function(event, toState) {
                            if(toState.name != 'items') {
                                _menu.query = '';
                            }
                        }
                    );

                    $scope.$watch('menu.searchResult', function(data) {
                        if (_menu.query) {
                            $scope.$broadcast('searchResult', data);
                        }
                    }, false);

                    _tab.activeProject = function() {
                        if(angular.isArray(_tab.projectList) && _tab.projectList.length>0){
                            _tab.projectList.sort(function(a, b) {
                                return(a.order < b.order ? 1 : -1);
                            });
                            if (!$rootScope.currentProject) {
                            		$rootScope.currentProject = _tab.projectList[0];
		                			var storageData = {
		                				id: $rootScope.currentProject.id,
		                				name: $rootScope.currentProject.name
		                			};
		                			storageService.setItem(storageType,'currentProject',storageData);
                            }
                        } else {
                            $rootScope.currentProject = null;
                            storageService.removeItem(storageType,'currentProject');
                        }
                    };

                    _tab.getProjectData = function() {
                        DBService.openDB().then(function () {
                            DBService.fetchStoreByCursor('projects').then(function (projects) {
                                _tab.projectList = projects;
                                _tab.activeProject();
                            },function (error) {
                                console.log(error);
                            });
                        });
                    };
                    _tab.getProjectData();

                    _tab.search = function(query) {
                        var data = query.toString();
                        var result;
                        // search projects
                        if ($state.current.name == 'projects') {
                        		result = [];
                        		angular.forEach($scope.projectData, function(p,i,arr) {
	                    			if (p.name.indexOf(data) !== -1) {
	                    				result.push(p);
	                    			}
	                    			if (i === arr.length-1) {
	                    				_menu.searchResult = {
                                        projects: result
                                    };
	                    			}
	                    		});
//                          DBService.fuzzyQueryData('projects', 'nameIndex', data)
//                              .then(function(projects) {
//                                  _menu.searchResult = {
//                                      projects: projects
//                                  };
//                              }, function(error) {
//                                  console.log("no match projects");
//                              });
                        // search folders, lists and items
                        } else if ($rootScope.currentProject) {
                            var pid = $rootScope.currentProject.id;
                            result = {};
                            var storeName;
                            if ($rootScope.clientWidth) {
                                storeName = ['folders', 'lists'];
                            } else {
                                storeName = ['folders', 'lists', 'items'];
                            }
                            angular.forEach(storeName, function(name,index) {
                            		result[name] = [];
		                    		angular.forEach($scope.listData[name], function(e) {
		                    			if (e.name.indexOf(data) !== -1) {
		                    				result[name].push(e);
		                    			}
		                    		});
		                    		if (name == 'items') {
		                    			DBService.getMultipleData('items', 'projectIdIndex', pid)
		                    				.then(function(allItems) {
		                    					if (allItems.length > 0) {
		                    						angular.forEach(allItems, function(item,i) {
			                    						if (item.name.indexOf(data) !== -1) {
			                    							
			                    							result[name].push(item);
			                    						}
			                    						if (i === allItems.length-1) {
			                    							_menu.searchResult = result;
			                    							if (result.items.length > 0) {
				                                            _menu.itemSearch = true;
				                                        } else {
				                                            _menu.itemSearch = false;
				                                        }
			                    						}
			                    					});
		                    					} else {
		                    						_menu.searchResult = result;
		                    					}
		                    				});
		                    		}
		                    		if (storeName.length === 2 && index === storeName.length - 1) {
		                    			_menu.searchResult = result;
		                    		}
//                              DBService.fuzzyQueryData(name, 'nameIndex', data)
//                                  .then(function(rows) {
//                                      var arr = [];
//                                      if (rows && rows.length > 0) {
//                                          angular.forEach(rows, function(r,i){
//                                              if (r.projectId === pid) {
//                                                  arr.push(r);
//                                              }
//                                              if (i === rows.length - 1) {
//                                                  result[name] = arr;
//                                              }
//                                          });
//                                      }
//                                      if (index === storeName.length - 1) {
//                                          _menu.searchResult = result;
//                                          if (name == 'items') {
//                                              if (rows.length > 0) {
//                                                  _menu.itemSearch = true;
//                                              } else {
//                                                  _menu.itemSearch = false;
//                                              }
//                                          }
//                                      }
//                                  }, function(error) {
//                                      console.log("no match data");
//                                  });
                            });
                        }
                    };

                    _menu.goResult = function(item) {
                        _menu.searchResult = {
                            item: item
                        };
                        _menu.itemSearch = false;
                        $state.go('items');
                    };
                   
                    _tab.clearSearch = function(){
                    		_menu.query = '';
                    		_menu.itemSearch = false;
                        _tab.showSearch = false;
                    };
                    
                    _tab.clearItemSearch = function() {
                    		$rootScope.$emit('searchItem', null);
                    };
                    
                    function getUserInfo(){
                        UserService.getUserInfo().then(function(userInfo){
                            _tab.userInfo = userInfo;
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