/**
 * Created by gam on 3/7/2017.
 */
(function () {
    'use strict';
    ApplicationConfiguration.registerModule('checklists.module.setting');
    angular.module('checklists.module.setting')
        .config(['$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state('setting', {
                        url: '/setting',
                        parent: 'default',
                        views: {
                            'menu@default': {
                                templateUrl: 'module/setting/views/setting.html',
                                controller: 'settingController',
                                controllerAs: 'setting'
                            }
                        }
                    });
            }
        ])
        .controller('settingController',[
            '$scope',
            '$rootScope',
            '$state',
            '$ionicPopover',
            '$cordovaFile',
            'toastr',
            'IndexDBService',
            'UserService',
            'Constants',
            '$translate',
            '$cordovaDevice',
            'PictureService',
            function(
                $scope,
                $rootScope,
                $state,
                $ionicPopover,
                $cordovaFile,
                toastr,
                IndexDBService,
                UserService,
                Constants,
                $translate,
                $cordovaDevice,
                PictureService){

                var _setting = this;

                _setting.translation = {
                    email: $translate.instant('common.email'),
                    ok: $translate.instant('common.ok'),
                    cancel: $translate.instant('common.cancel'),
                    takePhoto: $translate.instant('common.takePhoto'),
                    choosePhoto: $translate.instant('common.choosePhoto'),
                    emailError: $translate.instant('setting.emailError')
                };

                function createDir() {
                    var devicePath = IndexDBService.getDevicePath();

                    IndexDBService.createDir(devicePath, 'data')
                        .then(function (success) {
                            console.log(success);
                            var dataPath = devicePath + Constants.globals.dataPath;
                            IndexDBService.createDir(dataPath, 'users')
                                .then(function (success) {
                                    console.log(success);
                                },function (error) {
                                    console.log(error);
                                });
                        });
                }
                if(window.cordova) {
                    createDir();
                }
                function getUserInfo(){
                    UserService.getUserInfo().then(function(userInfo){
                        _setting.userInfo = userInfo;
                        _setting.pictureName = _setting.userInfo.pictureName;
                    });
                }
                getUserInfo();
                
                $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams) {
                        if (toState.name == 'setting') {
                    			getUserInfo();
                    		}
                    }
                );

                $ionicPopover.fromTemplateUrl('setting-pictures-add.html', {
                    scope: $scope
                }).then(function(popover) {
                    $scope.popover = popover;
                });

                $scope.openPopover = function($event) {
                    $scope.popover.show($event);
                };
                $scope.closePopover = function() {
                    $scope.popover.hide();
                };

                $scope.$on('$destroy', function() {
                    $scope.popover.remove();
                });
                
                _setting.addPictures = function (act){
                    $scope.closePopover();
                    var options = {
                        storeName: 'users',
                        id: $rootScope.userid || 1
                    };

                    if(window.cordova) {
                        if (act === 0) {
                            options.sourceType = Camera.PictureSourceType.CAMERA;
                        } else {
                            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                        }
                        PictureService.takePhoto(options);
                    }
                };

                _setting.save = function(){
                    IndexDBService.addDataItem('users', _setting.userInfo)
                        .then(function(result) {
                            UserService.getUserFromIndexDB();
                            console.log("add user success");
                            $state.go('lists');
                        }, function(error) {
                            console.log("add user fail:" + error);
                        });
                };

                _setting.cancel = function(){
                    UserService.getUserInfo(true).then(function(userInfo){
                        _setting.userInfo = userInfo;
                        _setting.pictureName = _setting.userInfo.pictureName;
                        $state.go('lists');
                    }, function(error) {
                        $state.go('lists');
                    });
                };

            }]);
})();
