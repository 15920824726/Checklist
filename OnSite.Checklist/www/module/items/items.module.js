(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.items');

    angular.module('checklists.module.items')
    	.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
    				.state('items', {
                		url: '/items',
                        parent: 'lists',
                        views: {
	                        'desktop@default': {
	                        	templateUrl: 'module/items/views/items.html',
                                controller: 'itemsController',
                                controllerAs: 'item'
	                        }
                        },
                        params:{'currentList':{}}
                   	});
    			}
        ])
    	.controller('itemsController', [
            '$scope',
            '$rootScope',
            '$stateParams',
            '$ionicScrollDelegate',
            'toastr',
            '$filter',
            '$http',
            '$translate',
            'IndexDBService',
            'Constants',
			'$cordovaDevice',
			function(
                $scope,
                $rootScope,
                $stateParams,
                $ionicScrollDelegate,
                toastr,
                $filter,
                $http,
                $translate,
                IndexDBService,
                Constants,
                $cordovaDevice) {
                var DBService = IndexDBService;
                var _item = this;
                _item.showReorder = false;
                _item.isReorder = false;
                _item.translation = {
                    addItem: $translate.instant('items.addItem'),
                    delete: $translate.instant('common.delete'),
                    ok: $translate.instant('common.ok'),
                    fail: $translate.instant('common.fail'),
                    na: $translate.instant('common.na')
                };


                _item.isEdit = false;
                _item.editText = $translate.instant('common.edit');
                _item.isAddForm = false;
                _item.isFolder = true;
                _item.status = {
                    fail: false,
                    ok: false,
                    na: false
                };
                _item.currentList = $stateParams.currentList;
                $http.get("content/img/icon.json")
                    .success(function(data){
                        $scope.imgData=data;
                    });



                // it's used to "add" is available for item level
                function isFolder(data){
                    if(data&&angular.isObject(data)&&data.hasOwnProperty('folderId')){
                        _item.isFolder = false;
                    }else{
                        _item.isFolder = true;
                    }
                }
                isFolder(_item.currentList);

                $rootScope.$on('searchItem',function(event, data) {
                		console.log(data);
                    _item.search = data;
                    if (data) {
                        _item.scrollTo(_item.search.order);
                    }
                });

                $rootScope.$on('hasPicture',function (event, data) {
					if (data.hasOwnProperty('hasImg')) {
						angular.forEach(_item.list, function(e) {
							if (e.id == data.itemId) {
								e.hasImg = data.hasImg;
							}
						});
					}
	            });
                //add note icon to item
                $rootScope.$on('noteChange',function (event, data) {
                    if (data.hasOwnProperty('note')) {
                        angular.forEach(_item.list, function(e) {
                            if (e.id == data.itemId) {
                                e.note = data.note;
                            }
                        });
                    }
                });
                $scope.$on('ngRepeatFinished', function() {
                    if (_item.search) {
                        _item.scrollTo(_item.search.order);
                    }
                });

                _item.scrollTo = function(order) {
                    var t = $ionicScrollDelegate.getScrollPosition().top;
                    var i = document.getElementById("i"+order);
                    if (i) {
                        var h = i.offsetTop;
                        $ionicScrollDelegate.$getByHandle('content').scrollBy(0,h-t,true);
                    }
                };

                _item.getData = function(isActive) {
                    if (!!_item.currentList) {
                        DBService.openDB().then(function() {
                            var id = _item.currentList.id;
                            var index;
                            if (!_item.currentList.hasOwnProperty('folderId')) {
                                index = 'folderIdIndex';
                            } else {
                                index = 'listIdIndex';
                            }
                            DBService.getMultipleData('items',index,id)
                                .then(function(items) {
                                    _item.list = items;
                                    if(_item.list.length>1){
                                        _item.isReorder = true;
                                    }else{
                                        _item.isReorder = false;
                                    }
                                    itemsSort('order');
                                    if(isActive){
                                        _item.toggleMenu(_item.list[0]);
                                    }
                                }, function(error) {
                                    console.log("get items fail:" + error);
                                });
                            });
                    } else {
                        _item.list = [];
                    }
                };
                _item.getData();
                _item.toggleMenu = function(data) {
                    $scope.pictureSrcs = [];
                    _item.activeId = data.id;
                    $scope.itemId = data.id;
                    $scope.itemName = name;
                    $scope.$parent.$parent.$$nextSibling.$emit('currentItem', data);
                    if(window.cordova){
                        var devicePath = DBService.getDevicePath();
                        
                        DBService.createDir(devicePath, 'data')
                            .then(function (success) {
                                console.log(success);
                                var dataPath = devicePath + Constants.globals.dataPath;
                                DBService.createDir(dataPath, 'picture')
                                    .then(function (success) { console.log(success);},
                                        function(error){

                                            console.log(error);
                                        });
                            });
                    }


                };
                $rootScope.$on('modifyItem', function (event,data) {
                    _item.getData();
                });
                _item.setStatus = function(act,data){
                    data = data || _item.status;
                    switch (act) {
                        case 0:
                            data.ok = true;
                            data.fail = false;
                            data.na = false;
                            break;
                        case 1:
                            data.ok = false;
                            data.fail = true;
                            data.na = false;
                            break;
                        case 2:
                            data.ok = false;
                            data.fail = false;
                            data.na = true;
                            break;
                    }
                    return data;
                };
                _item.add = function() {
                    if (!_item.currentList && !_item.currentList.hasOwnProperty('folderId')) {
                        toastr.warning($translate.instant('items.selectList'));
                        return;
                    }
                    _item.formatDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                    DBService.getMultipleData('items','projectIdIndex',_item.currentList.projectId)
                        .then(function(items) {
                            if(angular.isArray(items)){
                                _item.code = assistant.generateCode(items.length+1);
                            }else{
                                _item.code = assistant.generateCode(1);
                            }

                            if (!!_item.name) {
                                var orderId;
                                if(_item.list && angular.isArray(_item.list) && _item.list.length>0){
                                    itemsSort('id');
                                    orderId = _item.list[0].id + 1;
                                }else{
                                    orderId = 0;
                                }
                                var param = {
                                    name: _item.name,
                                    listId: _item.currentList.id,
                                    folderId: _item.currentList.folderId,
                                    projectId: _item.currentList.projectId,
                                    order: orderId,
                                    formatDate:_item.formatDate,
                                    fail:_item.status.fail,
                                    ok:  _item.status.ok,
                                    na:  _item.status.na
                                };

                                var found = _item.list.some(function(f){
                                    return f.name == param.name;
                                });
                                if(found){
                                    toastr.error("The item name [" + param.name + "] already exists, please rename the item.");
                                }else{
                                    DBService.addDataItem('items', param)
                                        .then(function(result) {
                                            _item.getData(true);
                                            _item.name = '';
                                            _item.isAddForm = false;
                                            console.log("add item success");
                                            _item.status.fail = false;
                                            _item.status.ok = false;
                                            _item.status.na = false;
                                        }, function(error) {
                                            console.log("add item fail:" + error);

                                        });
                                }

                            }

                        }, function(error) {
                            console.log("get items fail:" + error);
                        });
                };

                _item.del = function(id) {
                    DBService.deleteItem(id)
                        .then(function(result) {
                            _item.getData();
                            console.log("del item success");
                        }, function(error) {
                            console.log("del item fail:" + error);
                        });
                };

                function getDataByItemId(itemId){
                    var editItem;
                    for(var i=0; i<_item.list.length;i++){
                        var item = _item.list[i];
                        if(item.id == itemId){
                            editItem = item;
                            break;
                        }
                    }
                    return editItem;
                }

                _item.edit = function(itemId) {
                    _item.editId = itemId;
                    if(_item.isEdit){
                       var editItem = getDataByItemId(itemId);
                       //update item

                        var found = _item.list.some(function(f){
                            return f.name == editItem.name && f.id !== editItem.id;
                        });

                        if(found){
                            _item.isEdit = true;
                            _item.editText = $translate.instant('common.ok');
                            toastr.error("The item name [" + editItem.name + "] already exists, please rename the item.");
                        }else{
                            DBService.updateDataByKey('items',itemId,'name',editItem.name)
                                .then(function(){
                                    $scope.$emit('itemNameChange',{name:editItem.name});
                                    _item.getData();
                                });

                            _item.isEdit = false;
                            _item.editText = $translate.instant('common.edit');
                        }
                    }else{
                        _item.isEdit = true;
                        _item.editText = $translate.instant('common.ok');
                    }
                };

                _item.updateStatus = function(act,data) {
                    var param = _item.setStatus(act,data);
                    delete param.$$hashKey;
                    DBService.addDataItem('items', param)
                        .then(function(result) {
                            _item.getData();
                            console.log("update item success");
                        }, function(error) {
                            console.log("update item fail:" + error);
                        });
                };

                _item.move = function(item, fromIndex, toIndex) {
                    var toItem = _item.list[toIndex];
                    var toOrder = toItem.order;
                    var fromOrder = item.order;
                    // lists
                    item.order = toOrder;
                    toItem.order = fromOrder;
                    if(toItem.listId !== item.listId) {
                        // insert item into the target folder
                        item.listId = toItem.listId;
                    }

                    DBService.updateDataByKey('items',item.id,'order',item.order)
                        .then(function(){
                            DBService.updateDataByKey('items',toItem.id,'order',toItem.order)
                                .then(function(){
                                    itemsSort('order');
                                });
                        });
                };

                function itemsSort(orderby) {
                    var order = orderby || 'id';
                    _item.list.sort(function(a, b) {
                        return(a[order] < b[order] ? 1 : -1);
                    });
                }
                if($scope.currentListEvent){
                    $scope.currentListEvent();
                }
                $scope.currentListEvent = $scope.$parent.$parent.$parent.$on('currentList',function(event, data) {
                    _item.currentList = data;
                    isFolder(_item.currentList);
                    _item.getData();
                });

			    //
			    // it assistant to calculate the default code
			    //
                var assistant = {

                    //
                    //! itemId, item id is from item object eg 23 -> def-0023
                    //
                    generateCode: function (itemId) {
                        var res = "";
                        if (!itemId) {
                            console.log("item id must not be empty!");
                            toastr.warning($translate.instant('items.selectList'));
                            return res;
                        }

                        var prefix = "Def-";
                        if (itemId <= 9999) {
                            // convert into string type from number type
                            var id = itemId.toString();

                            // temporary array to store whole characters for item id
                            var data = [];
                            var len = id.length;
                            for (var i = 0; i < len; ++i) {
                                data.push(id[i]);
                            }
                            // default is from 10000, so start from 4
                            for (var j = 4; j >= 0; j--) {
                                if (len < j) { // if length of number is greater than j, should append '0'
                                    res += '0';
                                }
                            }
                            // append remaining string into result
                            for (var n = 0; n < len; ++n) {
                                res += data[n];
                            }
                        }
                        else {
                           // if id is greater than 9999, means that it's not necessary to popluate '0' letter
                            res = itemId;
                        }

                        // append prefix content
                        prefix += res;

                        return prefix;
                    }
                };

			    // testing snip code, calling method
			    // var result = assistant.generateCode(9999);
			}
		]);
})();