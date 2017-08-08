(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.share');
    
    angular.module('checklists.module.share')
    	.config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
    				.state('share', {
                		url: '/share',
                        parent: 'tabs',
                        cache: false,
                        views: {
	                        'list': {
	                        	templateUrl: 'module/share/views/share.html',
                                controller: 'shareController',
                                controllerAs: 'share'
	                        }
                        }  
                   	})
                    .state('share.save', {
                        url: '/save',
                        cache: false,
                        views: {
                            'list@tabs': {
                                templateUrl: 'module/share/views/share-save.html',
                                controller: 'shareSaveController',
                                controllerAs: 'save'
                            }
                        }  
                    })
                    .state('share.save.preview', {
                        url: '/preview',
                        cache: false,
                        views: {
                            'desktop@default': {
                                templateUrl: 'module/share/views/share-save-preview.html',
                                controller: 'sharePreviewController'
                            }
                        }  
                    });
    			}
        ])
    	.controller('shareController', [
            '$q',
            '$rootScope',
            '$state',
            '$cordovaFile',
            'IndexDBService',
            'TempDataService',
            'Constants',
            '$translate',
			'$cordovaDevice',
			function(
            $q,
            $rootScope,
            $state,
            $cordovaFile,
            IndexDBService,
            TempDataService,
			Constants,
            $translate,
            $cordovaDevice) {

                var dataService = TempDataService;

                var _share = this;
				_share.all = false;

                _share.translation = {
                    select: $translate.instant('export.select'),
                    ok: $translate.instant('common.ok'),
                    cancel: $translate.instant('common.cancel')
                };

                var data = dataService.getData();
                if (data) {
                    _share.currentProject = data.currentProject;
                    _share.menuList = data.menuList;
                    if (data.hasOwnProperty('all')) {
                    		_share.all = data.all;
                    }
                    if(_share.menuList){
                        selectOne();
                    }
                }
                
                _share.cancel = function() {
                    dataService.resetData();
                    $state.go('lists');
                    $rootScope.$emit('pdfShow', false);
                };

                _share.goUpload = function(){
                    dataService.setData({
                        currentProject: _share.currentProject,
                        menuList: _share.menuList,
                        all: _share.all
                    });
                    if (window.cordova) {
                        var devicePath = IndexDBService.getDevicePath();

                        //create dir in localDevice
                        IndexDBService.createDir(devicePath, 'exportFile')
                            .then(function(success) {
                                console.log('create success');
                                IndexDBService.createDir(devicePath + '/exportFile','xml').then(function (success) {
                                   console.log('create xml folder success');
                                });
                                IndexDBService.createDir(devicePath + '/exportFile','pdf').then(function (success) {
                                   console.log('create pdf folder success');
                                });
                            }, function(err) {
                                console.log(err);
                            });
                    }
                    $state.go('share.save');
                };

                _share.clickItem = function(item) {
                    // folders
                    if (item.hasChild) {
                        item.isOpen = item.isOpen == 1 ? 0 : 1;
                        angular.forEach(_share.menuList, function(e) {
                            if (e.hasOwnProperty('folderId') && e.folderId === item.id) {
                                e.isOpen = e.isOpen == 1 ? 0 : 1;

                            }
                        });
                    }
                };
                
                function getPicture (item) {
                    var imgUrl = [];
                    IndexDBService.getAllPictures(item.id)
                        .then(function (pictures) {
                            if (angular.isArray(pictures) && pictures.length > 0) {
                                var devicePath = IndexDBService.getDevicePath();
                                var dataPath = devicePath + Constants.globals.picturePath;
                                pictures.forEach(function (e,i,arr) {

                                    if(devicePath !== null){

                                        $cordovaFile.readAsText(dataPath,e.fileName).then(function (data) {
                                            imgUrl.push("data:image/jpeg;base64," + data);
                                            if (i === arr.length - 1) {
                                                item.image = imgUrl;
                                            }
                                        }, function (error) {                                            
                                            console.log(error);
                                        });

                                    }
                                });
                            }
                        }, function (error) {
                            console.log(error);
                        });
                }

                _share.getItems = function(item) {
                    IndexDBService.getMultipleData('items','listIdIndex',item.id)
                        .then(function(items) {
                            item.items = items.sort(function(a, b) {
                                return(a.order < b.order ? 1 : -1);
                            });
                            angular.forEach(item.items, function(e) {
                            		getPicture(e);
                            });
                        }, function(error) {
                            console.log("get items fail:" + error);
                        });
                };

                _share.selectItem = function(item) {
                    // folders
                    if (item.hasChild) {
                        angular.forEach(_share.menuList, function(e) {
                            if (e.hasOwnProperty('folderId') && e.folderId === item.id) {
                                e.checked = item.checked;
                                _share.getItems(e);
                            }
                        });
                    // lists
                    } else if (item.hasOwnProperty('folderId') && !item.hasOwnProperty('items')) {
                        _share.getItems(item);
                    }
                    _share.all = false;
                    selectOne();
                };
                
                _share.selectAll = function() {
                    if(angular.isArray(_share.menuList) && _share.menuList.length > 0) {
                        angular.forEach(_share.menuList, function(item) {
                            item.checked = _share.all;
                            _share.getItems(item);
                        });
                    }
                    _share.selectOne = _share.all;
                };
                
                //OK disabled
                function selectOne() {
                    var i = 0;
                    angular.forEach(_share.menuList, function(item) {
                        if (item.checked === true) {
                        		i++;
                        }
                    });
                    if (i >= 1) {
                        _share.selectOne = true;

                        // if all item are checked, therefore share all should be checked, otherwise unchecked.
                        _share.all = (i == _share.menuList.length) ? true : false;

                    } else {
                        _share.selectOne = false;
                    }
                }
			}
		])
        .controller('shareSaveController', [
            '$rootScope',
            '$state',
            '$cordovaFileTransfer',
            'TempDataService',
            'UploadDataService',
            'toastr',
            '$translate',
            'menuCtrl',
            '$cordovaDevice',
            'IndexDBService',
            function (
            $rootScope,
            $state,
            $cordovaFileTransfer,
            TempDataService,
            UploadDataService,
            toastr,
            $translate,
            menuCtrl,
            $cordovaDevice,
            IndexDBService) {
                
                var dataService = TempDataService;

                var _save = this;

                _save.translation = {
                    upload: $translate.instant('export.upload'),
                    format: $translate.instant('export.format'),
                    uploadTo: $translate.instant('export.uploadTo'),
                    ok: $translate.instant('common.ok'),
                    cancel: $translate.instant('common.cancel')
                };

                _save.list = [];
    				_save.hasUpload = false;

                var data = dataService.getData();
                if (data) {
                    _save.currentProject = data.currentProject;
                    _save.menuList = data.menuList;
                    var uploadList = [];
                    angular.forEach(_save.menuList, function(e){
                        if (e.checked) {
                            uploadList.push(e);
                        }
                    });
                }

                _save.formatList=[
                    {
                        formatId: 1,
                        name: 'PDF',
                        icon: 'icon-file-pdf-o',
                        checked: false
                    },
                    // {
                    //     formatId:2,
                    //     name:'XML',
                    //     icon:'icon-xml',
                    //     checked:false
                    // }
                ];

                _save.diskList=[
                    {
                        diskId: 1,
                        name: 'LocalDevice',
                        icon: 'ion-iphone',
                        show: false
                    },
                    // {
                    //     diskId: 2,
                    //     name:'GoogleDrive',
                    //     icon: 'ion-social-google-outline',
                    //     show: false
                    // },
                    // {
                    //     diskId: 3,
                    //     name: 'OneDrive',
                    //     icon: 'icon-onedrive',
                    //     show: false
                    // },
                    // {
                    //     diskId: 4,
                    //     name:'Dropbox',
                    //     icon:'ion-social-dropbox',
                    //     show:false
                    // },
                    // {
                    //     diskId: 5,
                    //     name: 'iTWO4.0',
                    //     icon:'ion-ios-upload-outline',
                    //     show:false
                    // },
                    // {
                    //     diskId: 6,
                    //     name: 'iTWO',
                    //     icon: 'ion-ios-upload-outline',
                    //     show: false
                    // }
                ];
                
                _save.format = {
                    formatId: 1
                };

                _save.disk = {
                    diskId: 1
                };

                _save.back = function() {
                    dataService.setData({
                        currentProject: _save.currentProject,
                        menuList: _save.menuList,
                        all: data.all
                    });
                    $state.go('share');
                    $rootScope.$emit('pdfShow', false);
                };

                _save.cancel = function() {
                    dataService.resetData();
                    $state.go('lists');
                    $rootScope.$emit('pdfShow', false);
                };

                _save.upload = function(){
                    if (uploadList.length > 0) {
                		switch (parseInt(_save.format.formatId)) {
							case 1:
								makePDF();
								_save.hasUpload = true;
								$rootScope.showLoading = true;
								if ($rootScope.clientWidth) {
                                    menuCtrl.toggleLeftMenu('close');
                                }
								break;
							case 2:

								break;
					    }
                    }
                };

                function uploadTo(data) {
                    $rootScope.$emit('pdfShow', true);
                    switch (parseInt(_save.disk.diskId)) {
                        case 1:
                            var now = new Date();
                            var pdfName = 'PDF' + now.getTime() + '.pdf';
                            var pdfUrl = 'data:application/pdf;base64,' + data.toString('base64');
                            if (window.cordova) {
                                var devicePath = IndexDBService.getDevicePath();
                               
                                var targetPath = devicePath + "/exportFile/pdf/" + pdfName;
                                //save pdf in local folder
                                dataService.setData(data);
                                $cordovaFileTransfer.download(pdfUrl, targetPath)
                                    .then(function(result) {
                                        dataService.setData(targetPath);
                                        $state.go('share.save.preview');
                                    }, function(err) {
                                        console.log(err);
                                    });
                            } else {
                                dataService.setData(data);
                                $state.go('share.save.preview');
                            }
                            break;
                        case 2:
                        
                            break;
                    }
                }

                function makePDF() {
                    UploadDataService.pdfData(_save.currentProject, uploadList)
                        .then(function(data) {
                            pdfMake.createPdf(data)
                                .getBuffer(function(buffer){
                                    uploadTo(buffer);
                                });
                        });
                }
            }
        ])
        .controller('sharePreviewController', [
            '$rootScope',
            '$scope',
            '$state',
            '$cordovaEmailComposer',
            'TempDataService',
            'toastr',
            '$translate',
            function(
            $rootScope,
            $scope,
            $state,
            $cordovaEmailComposer,
            TempDataService,
            toastr,
            $translate) {

                var dataService = TempDataService;
                var data = dataService.getData();
                $scope.translation = {
                    maxScale: $translate.instant('common.maxScale'),
                    minScale: $translate.instant('common.minScale')                    
                };
                if (window.cordova) {
                    $scope.pdfUrl = data;
                } else {
                    var currentBlob = new Blob([data], {type: 'application/pdf'});
                    $scope.pdfUrl = URL.createObjectURL(currentBlob);
                }
                $scope.scale = 1;
                $scope.pdfZoomIn = function() {                  
                    if($scope.scale<=2.4){
                        $scope.scale = $scope.zoomIn();
                    }else{
                        toastr.info($scope.translation.maxScale);
                    }
                };
                $scope.pdfFit = function(){
                    $scope.scale = 1;
                    $scope.fit();
                };
                $scope.pdfZoomOut = function(){                   
                    if($scope.scale>0.5){
                        $scope.scale = $scope.zoomOut();
                    }else{
                        toastr.info($scope.translation.minScale);
                        
                    } 
                };             
                $scope.goHome = function() {
                    dataService.resetData();
                    $state.go('lists');
                    $rootScope.$emit('pdfShow', false);
                };
                $scope.onLoad = function() {
                    $rootScope.showLoading = false;
                };

                $scope.sendEmail = function() {
                    if (window.cordova) {
                        var info = {
                            to: '',
                            attachments: [
                                $scope.pdfUrl
                            ],
                            subject: $translate.instant('export.pdfSubject'),
                            body: $translate.instant('export.pdfBody'),
                            isHtml: true
                        };
                        openEmail(info);
                    } else {
                        toastr.error($translate.instant('error.emailClient'));
                    }
                };

                function openEmail(info) {
                    $cordovaEmailComposer.isAvailable()
                        .then(function() {
                            $cordovaEmailComposer.open(info)
                                .then(true, false);
                        }, function (err) {
                            toastr.error($translate.instant('error.emailClient'));
                        });
                }
            }
        ]);   
})();