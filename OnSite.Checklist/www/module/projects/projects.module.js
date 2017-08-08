(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.projects');
    
    angular.module('checklists.module.projects')
    	.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
    				.state('projects', {
                		url: '/projects',
                        parent: 'tabs',
                        views: {
	                        'list': {
	                        	templateUrl: 'module/projects/views/projects.html',
                                controller: 'projectsController',
                                controllerAs: 'project'
	                        }
                        }  
                   	})
                    .state('projects.add', {
                        url: '/add',
                        views: {
                            'list@tabs': {
                                templateUrl: 'module/projects/views/projects-add.html',
                                controller: 'projectsAddController'
                            }
                        }  
                    });
    			}
        ])
    	.controller('projectsController', [
            '$scope',
            '$rootScope',
            '$state',
            '$ionicScrollDelegate',
            'IndexDBService',
            'TempDataService',
            'StorageService',
            'toastr',
            '$translate',
			function(
            $scope,
            $rootScope,
            $state,
            $ionicScrollDelegate,
            IndexDBService,
            TempDataService,
            StorageService,
            toastr,
            $translate) {
                var DBService =  IndexDBService;
                var dataService = TempDataService;
                var storageService = StorageService;
                    
                var storageType = storageService.getStore();
				var storageData = storageService.getItem(storageType, 'currentProject');
				
                var _project = this;
                _project.isEdit = false;
                _project.edited = false;
                _project.delItems = [];
                
                _project.translation = {
                    projects: $translate.instant('common.projects'),
                    edit: $translate.instant('common.edit'),
                    ok: $translate.instant('common.ok')
                };
                
                $scope.$on('$stateChangeSuccess',
					function(event, toState, toParams, fromState, fromParams) {
						_project.isEdit = false;
					}
				);

                $scope.$on('searchResult', function(event, data) {
                    _project.setSearchMenu(data);
                });
                _project.setSearchMenu = function(data){
                    _project.searchLists = data.projects;
                };
                _project.scrollTo = function(i) {
                    var t = $ionicScrollDelegate.getScrollPosition().top;
                    var h = document.getElementById("p"+i).offsetTop;
                    if (h-t === 0) {
                        $ionicScrollDelegate.$getByHandle('menu').scrollTop();
                    } else {
                        $ionicScrollDelegate.$getByHandle('menu').scrollBy(0,h-t,true);
                    }
                };
                    
                _project.getData = function() {
                    DBService.openDB().then(function () {
                        DBService.fetchStoreByCursor('projects').then(function (projects) {
                            _project.list = projects;
                            $scope.$parent.projectData = projects;
                            if(angular.isArray(_project.list) &&_project.list.length>0){
                                _project.list.sort(function(a, b) {
                                    return(a.order > b.order ? 1 : -1);
                                });
                                _project.list.reverse();
                                if (_project.list.length === 1) {
		            					_project.activeProject(_project.list[0]);
		            			}
                                _project.list.reverse();
                            }else{
                                $rootScope.currentProject = null;
                                storageService.removeItem(storageType,'currentProject');
                            }

                        },function (error) {
                            console.log(error);
                        });
                    });
                };
                _project.getData();
                _project.activeProject = function(item) {
                    if (!_project.isEdit) {
                        $rootScope.currentProject = item;
                        var storageData = {
                				id: $rootScope.currentProject.id,
                				name: $rootScope.currentProject.name
                			};
                			storageService.setItem(storageType,'currentProject',storageData);
                    }
                };
                _project.add = function() {
                    dataService.setData(_project.list);
                    $state.go('projects.add');
                };
                
                _project.update = function(item) {
                    item.edited = true;
                };
                
                _project.reorder = function() {
                    angular.forEach(_project.list, function(e, i) {
                        e.order = i;
                    });
                    _project.edited = true;
                };

                _project.del = function(item) {
                    var index = _project.list.indexOf(item);
                    if (item.hasOwnProperty('id')) {
                        _project.delItems.push(item);
                    }
                    _project.list.splice(index, 1);
                    _project.reorder();
                };
                
                _project.move = function(item, i1, i2) {               
                    _project.list.splice(i1, 1);                                       
                    _project.list.splice(i2, 0, item);                   
                    _project.reorder();
                };
                
                _project.save = function() {
                    var ready = true;
                    var names = [];
                    angular.forEach(_project.list, function(e, i, arr) {
                        var found;
                        var find = function(p) {
                            return p === e.name;
                        };
                        found = names.some(find);
                        if (found) {
                            toastr.error($translate.instant('error.duplicateKey',{key:e.name}));
                            ready = false;
                        } else {
                            names.push(e.name);
                        }
                    });
                    if (ready) {
                        _project.isEdit = !_project.isEdit;
                        angular.forEach(_project.list, function(e,i) {
                            var param = {
                                name: e.name,
                                order: e.order
                            };
                            if (e.hasOwnProperty('id')) {
                                param.id = e.id;
                            }
                            if (e.edited || !e.hasOwnProperty('id') || _project.edited) {
                                DBService.addDataItem('projects',param);
                            }
                            if (i === _project.list.length-1 && _project.delItems.length === 0) {
                                _project.getData();
                            }
                        });
                        if (_project.delItems.length > 0) {
                            angular.forEach(_project.delItems, function(e,i) {
                                DBService.deleteProject(e.id)
                                    .then(function() {
                                    		if ($rootScope.currentProject && e.id === $rootScope.currentProject.id) {
                                    			if (angular.isArray(_project.list) && _project.list.length > 1) {
					            					_project.activeProject(_project.list[0]);
					            				}
                                    		}
                                        if (i === _project.delItems.length-1) {
                                            _project.delItems = [];
                                            _project.getData();
                                        }
                                    });
                            });
                        }
                        $ionicScrollDelegate.scrollTop();
                    }
                };
			}
		])
        .controller('projectsAddController',[
            '$scope',
            '$rootScope',
            '$state',
            '$timeout',
            'TempDataService',
            'IndexDBService',
            'StorageService',
            '$translate',
            function (
            $scope,
            $rootScope,
            $state,
            $timeout,
            TempDataService,
            IndexDBService,
            StorageService,
            $translate) {
                var dataService = TempDataService;
                var lists = dataService.getData();
                var storageService = StorageService;
                    
                var storageType = storageService.getStore();
				
                $scope.data = {};

                $scope.translation = {
                    newProject: $translate.instant('projects.newProject'),
                    projectName: $translate.instant('projects.projectName'),
                    cancel: $translate.instant('common.cancel'),
                    ok: $translate.instant('common.ok')
                };

                $scope.add = function(name) {
                    if (!!name) {
                        var orderId;
                        if(lists && angular.isArray(lists) && lists.length>0){
                            sort(lists,'id');
                            orderId = lists[0].order + 1;
                        }else{
                            orderId = 0;
                        }
                        var item = {
                            name: name,
                            order: orderId
                        };
                        IndexDBService.addDataItem('projects',item)
                        		.then(function(id){
                        				item.id = id;
                                    if(angular.isArray(lists)){
                                        lists.push(item);
                                    }else{
                                        lists = [item];
                                    }
                                    if (lists && angular.isArray(lists) && lists.length === 1) {
                                    		$rootScope.currentProject = item;
				                			storageService.setItem(storageType,'currentProject',item);
                                    }
                                    dataService.setData({
                                        lists: lists
                                    });
                                    $state.go('projects');
                    			});
                    }
               };
                $timeout(function(){
                    var input = document.getElementById('projectName');
                    input.focus();
                },300);
                function sort(arr,orderby) {
                    var orderType = orderby || 'id';
                    arr.sort(function(a, b) {
                        return(a[orderType] < b[orderType] ? 1 : -1);
                    });
                }
            }
        ]);        
})();