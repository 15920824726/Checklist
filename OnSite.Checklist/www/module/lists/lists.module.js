(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.lists');
    angular.module('checklists.module.lists')
    	.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
                	.state('lists', {
                	    url: '/lists',
                	    parent: 'tabs',
                	    views: {
                	        'list': {
                	            templateUrl: 'module/lists/views/lists.html',
                	            controller: 'listsController',
                	            controllerAs: 'list'
                	        }
                	    }
                	})
                    .state('lists.add', {
                        url: '/add',
                        views: {
                            'list@tabs': {
                                templateUrl: 'module/lists/views/lists-add.html',
                                controller: 'listsAddController'
                            }
                        }
                    })
                    .state('lists.addfolder', {
                        url: '/addfolder',
                        views: {
                            'list@tabs': {
                                templateUrl: 'module/lists/views/lists-addfolder.html',
                                controller: 'listsAddFolderController'
                            }
                        }
                    });
            }
    	])
    	.controller('listsController', [
            '$rootScope',
            '$scope',
            '$state',
            '$ionicPopover',
            '$ionicScrollDelegate',
            'IndexDBService',
            'TempDataService',
            'toastr',
            '$translate',
            'menuCtrl',
			function (
            $rootScope,
            $scope,
            $state,
            $ionicPopover,
            $ionicScrollDelegate,
            IndexDBService,
            TempDataService,
            toastr,
            $translate,
			menuCtrl) {
			    var DBService = IndexDBService;
			    var dataService = TempDataService;

			    var _list = this;
			    _list.isEdit = false;
			    _list.edited = false;
			    _list.delFolders = [];
			    _list.delLists = [];

                _list.translation = {
                    checklists: $translate.instant('common.checklists'),
                    ok: $translate.instant('common.ok'),
                    addFolder: $translate.instant('common.addFolder'),
                    addChecklists: $translate.instant('common.addChecklists')
                };

			    var _tab = $scope.$parent.tab;

			    $scope.$watch('currentProject', function (data) {
			        if (data !== null || data !== undefined) {
			            _list.getData();
			        } else {
			            _list.menuList = [];
			        }
			    });

			    $scope.$on('searchResult', function (event, data) {
			        _list.searchData = data;
			        _list.setSearchMenu(data);
			    });
			    
			    window.onbeforeunload = function() {
			    		$state.go('lists');
			    };

			    _list.scrollTo = function (i) {
			        var t = $ionicScrollDelegate.getScrollPosition().top;
			        var h = document.getElementById("m" + i).offsetTop;
			        $ionicScrollDelegate.$getByHandle('menu').scrollBy(0, h - t, true);
			    };

			    _list.setSearchMenu = function (data) {
			        _list.searchList = [];
			        var parentId;
			        if (!data.item) {
			            _list.menuList.forEach(function (e, i) {
			                // e is a folder
			                var item;
			                var found = false;
			                var findSelf = function (f) {
			                    return f.id === e.id;
			                };
			                var findFolder = function (c) {
			                    return c.folderId === e.id;
			                };
			                var findlist = function (c) {
			                    return c.listId === e.id;
			                };
			                if (!e.hasOwnProperty('folderId')) {
			                    if (data.folders) {
			                        found = data.folders.some(findSelf);
			                        if (!item && found) {
			                            item = angular.copy(e);
			                            item.isOpen = 1;
			                            item.search = 1;
			                            _list.searchList.push(item);
			                            if (e.hasChild) {
			                                parentId = e.id;
			                            }
			                        }
			                    }
			                    if (data.lists || data.items) {
			                        for (var name in data) {
			                            if (name == 'lists' || name == 'items') {
			                                found = data[name].some(findFolder);
			                                if (!item && found) {
			                                    item = angular.copy(e);
			                                    item.isOpen = 1;
			                                    _list.searchList.push(item);
			                                    if (e.hasChild) {
			                                        parentId = e.id;
			                                    }
			                                }
			                            }
			                        }
			                    }
			                    // e is a list
			                } else {
			                    if (data.lists) {
			                        found = data.lists.some(findSelf);
			                        if (found) {
			                            item = angular.copy(e);
			                            item.isOpen = 1;
			                            item.search = 1;
			                            _list.searchList.push(item);
			                        }
			                    }
			                    if (data.items) {
			                        found = data.items.some(findlist);
			                        if (!item && found) {
			                            item = angular.copy(e);
			                            item.isOpen = 1;
			                            _list.searchList.push(item);
			                        }
			                    }
			                    if (!item && parentId === e.folderId) {
									item = angular.copy(e);
									item.isOpen = 1;
									_list.searchList.push(item);
								}
			                }
			            });
			        } else {
			            _list.isEdit = false;
			            angular.forEach(_list.menuList, function (e, i) {
			                // open folder
			                if (!e.hasOwnProperty('folderId') && e.id === data.item.folderId) {
			                    e.isOpen = 1;
			                    parentId = e.id;
			                    // select list
			                } else if (e.hasOwnProperty('folderId') && e.id === data.item.listId) {
			                    e.isOpen = 1;
			                    e.isActive = 1;
			                    _list.activeList(e);
			                    _list.scrollTo(i);
			                } else if (e.hasOwnProperty('folderId') && e.folderId === parentId) {
			                    e.isOpen = 1;
			                    e.isActive = 0;
			                }
			            });
			            $rootScope.$emit('searchItem', data.item);
			            _tab.clearSearch();
			        }
			    };

			    _list.getData = function () {
			        var currentProject = $rootScope.currentProject;
			        if (currentProject !== null && angular.isObject(currentProject)) {
			            DBService.openDB().then(function () {
			                if (currentProject !== null && angular.isObject(currentProject)) {
			                    var id = currentProject.id;
			                    DBService.getMultipleData('folders', 'projectIdIndex', id)
                                    .then(function (folders) {
                                        _list.folders = folders;
                                        DBService.getMultipleData('lists', 'projectIdIndex', id)
                                            .then(function (lists) {
                                                _list.lists = lists;
                                                _list.setMenu();
                                                $scope.$parent.listData = {
                                                		folders: folders,
                                                		lists: lists
                                                };
                                            }, function (error) {
                                                console.log("get lists fail:" + error);
                                            });
                                    }, function (error) {
                                        console.log("get folders fail:" + error);
                                    });
			                } else {
			                    _list.menuList = [];
			                }
			            });
			        } else {
			            _list.menuList = [];
			        }
			    };

			    _list.setMenu = function () {
			        _list.folders.sort(function (a, b) {
			            return (a.order > b.order ? 1 : -1);
			        });
			        _list.menuList = angular.copy(_list.folders);
			        var tempList = {};
			        angular.forEach(_list.lists, function (e) {
			            if (!tempList[e.folderId]) {
			                tempList[e.folderId] = [];
			            }
			            var list = angular.copy(e);
			            tempList[e.folderId].push(list);
			        });
			        angular.forEach(tempList, function (e) {
			            e.sort(function (a, b) {
			                return (a.order > b.order ? 1 : -1);
			            });
			        });
			        // this loop need improve
			        angular.forEach(_list.folders, function (e1, i1) {
			            if (tempList.hasOwnProperty(e1.id)) {
			                angular.forEach(_list.menuList, function (e2, i2, arr2) {
			                    if (!e2.hasOwnProperty('folderId') && e2.id === e1.id) {
			                        e2.hasChild = 1;
			                        if (_list.isEdit) {
			                            e2.isOpen = 1;
			                        }
			                        angular.forEach(tempList[e1.id], function (e3, i3) {
			                            if (e2.isOpen) {
			                                e3.isOpen = e2.isOpen;
			                            }
			                            _list.menuList.splice(i2 + i3 + 1, 0, e3);
			                        });
			                    }
			                });
			            }
			        });
			        _list.activeList(null);
			    };

			    _list.edit = function () {
			        _list.isEdit = true;
			        _list.searchData = null;
			        $scope.$emit('search', _list.searchData);
			        if (_list.isEdit) {
			            var parentId;
			            angular.forEach(_list.menuList, function (e) {
			                e.isOpen = 1;
			            });
			        }
			    };

			    $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams) {
                        var data = dataService.getData();
                        if(fromState.name == 'lists.addfolder') {
                            if(data.hasOwnProperty('folder')) {
                                _list.menuList = data.menuList;
                                var folder = data.folder;
                                if (angular.isArray(_list.folders)) {
                                    _list.folders.push(folder);
                                }else{
                                    _list.folders = [folder];
                                }
                                _list.setMenu();
                            }
                        } else if(fromState.name == 'lists.add') {
                            _list.lists = data.lists;
                            _list.setMenu();
                        } else if(toState.name != 'items') {
                            _list.getData();
                            _list.isEdit = false;
                        }
                    }
                );

			    _list.add = function (type) {
			        _list.closePopover();
			        _list.searchData = null;
			        $scope.$emit('search', _list.searchData);

			        if (!$rootScope.currentProject) {
			            toastr.warning($translate.instant('warning.noPrj'));
			            return;
			        }
			        // add folder
			        if (type === 0) {
			            dataService.setData({
			                folders: angular.copy(_list.folders),
			                menuList: angular.copy(_list.menuList)
			            });
			            $state.go('lists.addfolder');
			            // add list
			        } else {
			            if (!_list.folders || _list.folders.length === 0) {
                            toastr.warning($translate.instant('warning.noFolder'));
			                return;
			            }
			            dataService.setData({
			                folders: angular.copy(_list.folders),
			                lists: angular.copy(_list.lists)
			            });
			            $state.go('lists.add');
			        }
			    };

			    _list.update = function (item, search) {
			        if (search) {
			            angular.forEach(_list.menuList, function (e) {
			                if (item.hasOwnProperty('folderId') && e.hasOwnProperty('folderId') || !item.hasOwnProperty('folderId') && !e.hasOwnProperty('folderId')) {
			                    if (e.id === item.id) {
			                        e.name = item.name;
			                        e.edited = true;
			                    }
			                }
			            });
			        } else {
			            item.edited = true;
			        }
			    };
                _list.resetData = function () {
                    _list.isEdit = false;
                    _list.delLists = [];
                    _list.delFolders = [];
                    dataService.resetData();
                };
			    _list.del = function (item, search) {
			        var index;
			        if (search) {
			            angular.forEach(_list.menuList, function (e, i) {
			                if (item.hasOwnProperty('folderId') && e.hasOwnProperty('folderId') || !item.hasOwnProperty('folderId') && !e.hasOwnProperty('folderId')) {
			                    if (e.id === item.id) {
			                        index = i;
			                    }
			                }
			            });
			        } else {
			            index = _list.menuList.indexOf(item);
			        }
			        if (item.hasOwnProperty('id')) {
			            if (item.hasOwnProperty('folderId')) {
			                _list.delLists.push(item);
			            } else {
			                _list.delFolders.push(item);
			                var arr = _list.menuList;
			                for (var i = arr.length - 1; i >= 0; i--) {
			                    if (arr[i].isActive) {
			                        _list.activeList(null);
			                    }
			                    if (arr[i].hasOwnProperty('folderId') && arr[i].folderId === item.id) {
			                        arr.splice(i, 1);
			                    }
			                }
			            }
			        }
			        _list.menuList.splice(index, 1);
			        if (_list.searchData) {
			            _list.setSearchMenu(_list.searchData);
			        }
			    };

			    _list.reorder = function () {
			        var countC = 0;
			        var countF = 0;
			        var lists = [];
			        var folders = [];
			        angular.forEach(_list.menuList, function (e, i, arr) {
			            // lists
			            if (e.hasOwnProperty('folderId')) {
			                e.order = countC;
			                lists.push(e);
			                countC++;
			                // folders
			            } else {
			                e.order = countF;
			                folders.push(e);
			                countF++;
			            }
			            if (i === arr.length - 1) {
			                _list.folders = folders;
			                _list.lists = lists;
			                _list.setMenu();
			            }
			        });
			        _list.edited = true;
			    };

			    _list.move = function (item, fromIndex, toIndex) {
			        var toItem = _list.menuList[toIndex];
			        _list.menuList.splice(fromIndex, 1);
			        _list.menuList.splice(toIndex, 0, item);
			        // move list to another folder
			        if (item.hasOwnProperty('folderId')) {
			            if (toItem.hasOwnProperty('folderId')) {
			                if (toItem.folderId !== item.folderId) {
			                    item.folderId = toItem.folderId;
			                }
			            } else {
			                item.folderId = toItem.id;
			            }
			        }
			        _list.reorder();
			    };

			    _list.save = function () {
			        var ready = true;
			        var names = {
			            folders: [],
			            lists: []
			        };
			        angular.forEach(_list.menuList, function (e, i, arr) {
			            var found;
			            var findlist = function (f) {			            	
			                return f.name === e.name && f.folderId === e.folderId;
			            };
			            var findFolder = function (f) {
			                return f === e.name;
			            };
			            // lists
			            if (e.hasOwnProperty('folderId')) {
			                found = names.lists.some(findlist);
			                if (found) {
                                toastr.error($translate.instant('error.duplicateKey',{key:e.name}));
			                    ready = false;
			                } else {
			                    names.lists.push({name:e.name,folderId:e.folderId});
			                }
			                // folders
			            } else {
			                found = names.folders.some(findFolder);
			                if (found) {
                                toastr.error($translate.instant('error.duplicateKey',{key:e.name}));
			                    ready = false;
			                } else {
			                    names.folders.push(e.name);
			                }
			            }
			        });
			        if (ready) {
			            _list.isEdit = !_list.isEdit;
			            var param = {};
			            if (_list.delLists.length > 0) {
			                angular.forEach(_list.delLists, function (e, i, arr) {
			                    DBService.deleteList(e.id)
                                    .then(function () {
                                        if (e.isActive) {
                                            _list.activeList(null);
                                        }
                                        if (i === arr.length - 1 &&
                                            _list.delFolders.length === 0) {
                                            _list.getData();
                                        }
                                    });
			                });
			            }
			            if (_list.delFolders.length > 0) {
			                angular.forEach(_list.delFolders, function (e, i, arr) {
			                    DBService.deleteFolder(e.id)
                                    .then(function () {
                                        if (e.isActive) {
                                            _list.activeList(null);
                                        }
                                        if (i === arr.length - 1) {
                                            _list.getData();
                                        }
                                    });
			                });
			            }
			            angular.forEach(_list.menuList, function (e, i, arr) {
			                // lists
			                if (e.hasOwnProperty('folderId')) {
			                    param = {
			                        name: e.name,
			                        order: e.order,
			                        folderId: e.folderId,			        
			                        projectId: $rootScope.currentProject.id
			                    };
			                    if (e.hasOwnProperty('id')) {
			                        param.id = e.id;
			                    }
			                    if (e.edited || !e.hasOwnProperty('id') || _list.edited) {
			                        DBService.addDataItem('lists', param)
                                        .then(function () {
                                            if (i === arr.length - 1) {
                                                _list.getData();
                                            }
                                        });
			                    }
			                    // folders
			                } else {
			                    param = {
			                        id: e.id,
			                        name: e.name,
			                        order: e.order,
			                        projectId: $rootScope.currentProject.id
			                    };
			                    if (e.edited || _list.edited) {
			                        DBService.addDataItem('folders', param)
                                        .then(function () {
                                            if (i === arr.length - 1) {
                                                _list.getData();
                                            }
                                        });
			                    }
			                }
			            });
			        }
			    };

			    _list.activeList = function (item) {
			        if (!_list.isEdit) {
			            $scope.$parent.$parent.$parent.$$nextSibling.$emit('currentList', item);
			        }
			    };

			    _list.selectItem = function (item, search) {
			        if (!_list.isEdit) {
			            _list.activeList(item);
			            var list;
			            if (search) {
			                list = _list.searchList;
			            } else {
			                list = _list.menuList;
			            }
                        // list
	                    if(item.hasOwnProperty('folderId')){
	                        angular.forEach(list, function (e) {
	                            if (e.id === item.id && e.hasOwnProperty('folderId')) {
	                                e.isActive = 1;
	                            } else {
	                                e.isActive = 0;
	                            }
	                        });
	                    // folder
	                    } else {
	                    		angular.forEach(list, function (e) {
	                            if (e.id === item.id && !e.hasOwnProperty('folderId')) {
	                                e.isActive = 1;
	                            } else {
	                                e.isActive = 0;
	                            }
	                        });
	                    }
	                    if ($rootScope.clientWidth) {
	                    		menuCtrl.toggleLeftMenu('close');
	                    }
			            $state.go('items', { currentList: item });
			        }
			    };
			    
			    _list.clickItem = function(item, search, event) {
					if (event) {
						event.stopPropagation();
					}
					var list;
					if (search) {
						list = _list.searchList;
					} else {
						list = _list.menuList;
					}
                    if(!item.hasOwnProperty('folderId')){
                    		// folders
                        item.isOpen = item.isOpen == 1 ? 0 : 1;
                        $ionicScrollDelegate.resize();
                        // checklist
                        angular.forEach(list, function (e) {
                            if (e.hasOwnProperty('folderId') && e.folderId === item.id) {
                                e.isOpen = e.isOpen == 1 ? 0 : 1;
                            }
                        });
                    }
				};

			    $ionicPopover.fromTemplateUrl('lists-add.html', {
			        scope: $scope
			    }).then(function (popover) {
			        _list.popover = popover;
			    });

			    _list.openPopover = function ($event) {
			        _list.popover.show($event);
			    };
			    _list.closePopover = function () {
			        _list.popover.hide();
			    };

			    $scope.$on('$destroy', function () {
			        _list.popover.remove();
			    });

			    _list.goShare = function () {
			        var menuList = angular.copy(_list.menuList);
			        angular.forEach(menuList, function (e) {
			            if (e.hasOwnProperty('isActive')) {
			                delete e.isActive;
			            }
			            if (e.hasOwnProperty('isOpen')) {
			                e.isOpen = 0;
			            }
			        });
			        dataService.setData({
			            currentProject: _list.currentProject,
			            menuList: menuList
			        });
			        $state.go('share');
			    };
			}
    	])
        .controller('listsAddFolderController', [
            '$scope',
            '$state',
            '$timeout',
            '$translate',
            'toastr',
            'IndexDBService',
            'TempDataService',            
            function (
            $scope,
            $state,
            $timeout,
            $translate,
            toastr,
            IndexDBService,
            TempDataService
            ) {
                var dataService = TempDataService;
                var listData = dataService.getData();
                var folders = listData.folders;
                folders = folders ? folders : [];
                var menuList = listData.menuList;
                menuList = menuList ? menuList : [];

                $scope.data = {};

                $scope.translation = {
                    newFolder: $translate.instant('lists.newFolder'),
                    folderName: $translate.instant('lists.folderName'),
                    ok: $translate.instant('common.ok'),
                    cancel: $translate.instant('common.cancel')                    
                };

                $timeout(function () {
                    var input = document.getElementById('folderName');
                    input.focus();
                }, 300);
                $scope.add = function (name) {
                    var param = {
                        menuList: menuList
                    };
                    if (!!name) {
                        var orderId;
                        if (folders && angular.isArray(folders) && folders.length > 0) {
                            folders.sort(function (a, b) {
                                return (a.order < b.order ? 1 : -1);
                            });
                            orderId = folders[0].id + 1;
                        } else {
                            orderId = 0;
                        }
                        var item = {
                            name: name,
                            order: orderId,
                            projectId: $scope.currentProject.id
                        };                        

                        var found = folders.some(function(f){
                        	return f.name == name;
                        });

                        if(found){
                            toastr.error($translate.instant('error.duplicateKey',{key:item.name}));
                        }else{
							IndexDBService.addDataItem('folders', item)
								.then(function (folderId) {
									item.id = folderId;
									param.folder = item;
							        dataService.setData(param);
							        $state.go('lists');
								});
                        }                      
                    }


                };
            }
        ])
        .controller('listsAddController', [
            '$scope',
            '$state',
            '$timeout',
            '$translate',
            'toastr',
            'IndexDBService',
            'TempDataService',            
            function (
            $scope,
            $state,
            $timeout,
            $translate,
            toastr,
            IndexDBService,
            TempDataService) {

                var dataService = TempDataService;
                var listData = dataService.getData();
                $scope.folders = listData.folders;
                var lists = listData.lists;
                lists = lists ? lists : [];

                $scope.data = {};

                $scope.translation = {
                    newChecklists: $translate.instant('lists.newChecklists'),
                    folder: $translate.instant('lists.folder'),
                    checklistsName: $translate.instant('lists.checklistsName'),
                    ok: $translate.instant('common.ok'),
                    cancel: $translate.instant('common.cancel')
                };

                $timeout(function () {
                    var input = document.getElementById('listName');
                    input.focus();
                }, 300);

                $scope.add = function () {
                    var orderId;
                    if (lists && angular.isArray(lists) && lists.length > 0) {
                        lists.sort(function (a, b) {
                            return (a.order < b.order ? 1 : -1);
                        });
                        orderId = lists[0].id + 1;
                    } else {
                        orderId = 0;
                    }
                    if ($scope.data.name) {
                        var item = {
                            name: $scope.data.name,
                            folderId: $scope.data.folderId,
                            projectId: $scope.folders[0].projectId,
                            order: orderId
                        };
                        var found = lists.some(function(f){
                        	return f.name === item.name && f.folderId === item.folderId;
                        });

                        if(found){
                            toastr.error($translate.instant('error.duplicateKey',{key:item.name}));
                        }else{
	                        IndexDBService.addDataItem('lists', item).then(function (listId) {
	                           	item.id = listId;
	                            if (angular.isArray(lists)) {
                                    lists.push(item);
                                } else {
                                    lists = item;
                                }

                                dataService.setData({
                                    lists: lists
                                });
                                $state.go('lists');
	                        });
	                    }
                    }
                };
            }
        ]);
})();