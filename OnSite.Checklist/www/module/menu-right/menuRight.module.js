(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.menuRight');

    angular.module('checklists.module.menuRight')
    	.controller('menuRightController', [
            '$scope',
            '$rootScope',
            '$state',
            '$ionicModal',
            '$ionicPopup',
            '$ionicPopover',
            '$ionicScrollDelegate',
            '$cordovaFile',
            'IndexDBService',
            'TempDataService',
           	'$cordovaDatePicker',
			'toastr',
			'Constants',
			'$translate',
			'PictureService',
			function (
            $scope,
            $rootScope,
            $state,
            $ionicModal,
            $ionicPopup,
            $ionicPopover,
            $ionicScrollDelegate,
            $cordovaFile,
            IndexDBService,
            TempDataService,
			$cordovaDatePicker,
			toastr,
			Constants,
            $translate,
            PictureService) {
			    var DBService = IndexDBService;
			    var dataService = TempDataService;
                $scope.translation = {
                    checklistsRemovalCosts: $translate.instant('checklistsAttr.checklistsRemovalCosts'),
                    cancel: $translate.instant('common.cancel'),
                    save: $translate.instant('common.save'),
                    add: $translate.instant('common.add'),
                    AddPicture: $translate.instant('checklistsAttr.AddPicture'),
                    takePhoto: $translate.instant('common.takePhoto'),
                    choosePhoto: $translate.instant('common.choosePhoto'),
                    delete: $translate.instant('common.delete'),
                    addNote: $translate.instant('checklistsAttr.addNote')
                };

			    $scope.addPictures = function (act) {
			        $scope.closePopover();
					if(window.cordova){
						var options = {
                        	storeName: 'items',
                        	id: $scope.itemId
	                    };
	                    if(window.cordova) {
	                        if (act === 0) {
	                            options.sourceType = Camera.PictureSourceType.CAMERA;
	                        } else {
	                            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
	                        }
	                        PictureService.takePhoto(options);
	                    }
						$ionicScrollDelegate.resize();
					}else{
						toastr.warning('Only useful in Mobile!');
					}
			    };

			    $ionicPopover.fromTemplateUrl('pictures-add.html', {
			        scope: $scope
			    }).then(function (popover) {
			        $scope.popover = popover;
			    });

			    $scope.openPopover = function ($event) {
			        $scope.popover.show($event);
			    };
			    $scope.closePopover = function () {
			        $scope.popover.hide();
			    };

			    $scope.$on('$destroy',function(){
                    $scope.popover.remove();
				});

			    $scope.$parent.$on('currentItem', function (event, data) {
					$scope.itemId = data.id;
					$scope.currtentName=data.name;
                    $scope.getPicture();
                    $scope.getNote();
			    });

				$rootScope.$on('itemNameChange',function (event,data) {
					$scope.currtentName = data.name;
				});

			    $rootScope.$on('getPicture', function () {
			        $scope.getPicture();
			    });

			    $scope.ModifyItemInfo = function () {
			        DBService.openDB().then(function () {
						DBService.getDataByKey('items', $scope.itemId).then(function (item) {
							if(JSON.stringify(item)===JSON.stringify($scope.info)){
								//toastr.error('Nothing has modified!');
							}else{
								angular.forEach($scope.info, function (e, index) {
									DBService.updateDataByKey('items', $scope.itemId, index, e).then(function () {
										$rootScope.$emit('modifyItem', $scope.itemId);
										toastr.success($translate.instant('common.success'));
									},function(error){
										console.log(error);
									});
								});
							}
						}, function (error) {
							console.log(error);
						});
			        });
			    };

			    $scope.cancelInfo = function () {
					DBService.openDB().then(function () {
						DBService.getDataByKey('items', $scope.itemId).then(function (item) {
							if (item) {
								$scope.info = item;
							}
						}, function (error) {
							console.log(error);
						});
					});
			    };

			   $scope.getPicture = function () {// READ
			        $scope.pictureSrcs = [];
			        DBService.openDB().then(function () {
			            //console.log('open');
			            DBService.getAllPictures($scope.itemId).then(function (files) {
							var devicePath = IndexDBService.getDevicePath();
							var dataPath = devicePath + Constants.globals.picturePath;

			            	if(devicePath !== null){
                                
				                if (angular.isArray(files) && files.length > 0) {
				                    files.forEach(function (item) {                    	
										$cordovaFile.readAsText(dataPath,item.fileName).then(function (data) {
										    $scope.pictureSrcs.push({ 
										    	id: item.id,
										    	fileName: item.fileName,
										    	url: "data:image/jpeg;base64," + data
										    });										    
										}, function (error) {										    
										    console.log(error);
										});	                                    
				                    });
				                    DBService.updateDataByKey('items',$scope.itemId,'hasImg',1);
		                            $rootScope.$emit('hasPicture',{itemId: $scope.itemId, hasImg: 1});
								} else if (angular.isArray(files) && files.length === 0){
									DBService.updateDataByKey('items',$scope.itemId,'hasImg',0);
		                            $rootScope.$emit('hasPicture',{itemId: $scope.itemId, hasImg: 0});
								}
							}
			            }, function (error) {
			                console.log(error);
			            });
			        });
                    $ionicScrollDelegate.resize();
			    };

			    $scope.delPicture = function (id, name) {
			        DBService.delPicture(id, name).then(function (response) {
			            $scope.getPicture();
			        });
                    $ionicScrollDelegate.resize();
			    };

			    $scope.showPicture = function (url) {
			        var myPopup = $ionicPopup.show({
                        template: '<img src="' + url + '"/>',
			            //title: 'Enter Wi-Fi Password',
			            scope: $scope,
			            cssClass: 'full-picture',
			            buttons: [
                            {
                                text: '',
                                type: 'button-default button-icon icon ion-close-round blue pa t0 r10'
                            }
			            ]
			        });

			    };

			    $scope.note = {};
			    $scope.note.text = '';
			    changeNoteTitle(0);

			    $scope.getNote = function () {
			        DBService.openDB().then(function () {
			            DBService.getDataByKey('items', $scope.itemId).then(function (item) {
			                if (item) {
			                    $scope.note.text = item.note;
			                    changeNoteTitle(item.note);
			                }
			            }, function (error) {
			                console.log(error);
			                $scope.note.title = $translate.instant('checklistsAttr.addNote');
			            });
			        });
			    };

			    $scope.showNoteForm = function (act) {
			        // hide note form, act=0, show note form, act=1
			        if (act === 0) {
                        $scope.getNote();
			            $scope.isShowNote = false;
			        } else {
			            $scope.isShowNote = true;
			        }
			    };

			    $scope.addNote = function () {
			        var data = {
			            note: $scope.note.text
			        };
			        DBService.openDB().then(function () {
			            DBService.updateDataByKey('items', $scope.itemId, 'note', $scope.note.text).then(function () {
			                $scope.isShowNote = false;
			                changeNoteTitle($scope.note.text);
                            //'notechange' emit for update note icon in item
                            $rootScope.$emit('noteChange',{itemId: $scope.itemId, note : $scope.note.text});

                        });
			        });
                    $ionicScrollDelegate.resize();
			    };

			    function changeNoteTitle(act) {
			        // Add a note, act = false, Edit a note, act = ture
			        if (act) {
			            $scope.note.title = $translate.instant('checklistsAttr.editNote');
			        } else {
			            $scope.note.title = $translate.instant('checklistsAttr.addNote');
			        }
			    }

			    $scope.isShowInformation = false;
			    $scope.showOrHideInfor = function () {
			        $scope.isShowInformation = !$scope.isShowInformation;
					DBService.openDB().then(function () {
						DBService.getDataByKey('items', $scope.itemId).then(function (item) {
							if (item) {
								$scope.info = item;
							}
						}, function (error) {
							console.log(error);
						});
					});
                    $ionicScrollDelegate.resize();
			    };

			    $scope.isShowAttachment = true;
			    $scope.showOrHideAttachment = function () {
			        $scope.isShowAttachment = !$scope.isShowAttachment;
                    $ionicScrollDelegate.resize();
			    };

			    $scope.statuses = [
					{id:0, statue:$translate.instant('common.detected')},
					{id:1, statue:$translate.instant('common.inProgress')},
					{id:2, statue:$translate.instant('common.completed')},
					{id:3, statue:$translate.instant('common.rejected')}
				];
			    $scope.severities = [
					{id:0,severity:$translate.instant('common.low')},
					{id:1,severity:$translate.instant('common.medium')},
					{id:2,severity:$translate.instant('common.high')}
				];
			}
    	]);
})();