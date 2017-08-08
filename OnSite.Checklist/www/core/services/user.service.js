(function () {
    'use strict';
    angular.module("checklists.core.services")
        .service("UserService", [
            "$state",
            "$rootScope",
            "$q",
            "$http",
            "$cordovaFile",
            "StorageService",
            "IndexDBService",
            "Constants",
            function (
                $state,
                $rootScope,
                $q,
                $http,
                $cordovaFile,
                StorageService,
                IndexDBService,
                Constants) {
                var _user = this;
                var imgData;
                $http.get("content/img/icon.json")
                    .success(function(data){
                        imgData = data;
                    });
                _user.userInfo = {};

                _user.login = function (data) {
                    var params = data || {};
                    var defer = $q.defer();
                    $rootScope.userid = 1;
                    //defer.resolve(true);
                    //defer.reject(err);
                    return defer.promise;
                };

                _user.logout = function () {
                    $state.go('login');
                };

                _user.getUserFromIndexDB = function(){
                    var defer = $q.defer();
                    IndexDBService.openDB().then(function() {
                        $rootScope.userid = $rootScope.userid || 1;
                        var id = $rootScope.userid;
                        IndexDBService.getDataByKey('users',id)
                            .then(function(items) {
                                _user.userInfo.id          = items.id;
                                _user.userInfo.name        = items.name;
                                _user.userInfo.email       = items.email;
                                _user.userInfo.fileName    = items.fileName;

                                if(!_user.userInfo.fileName) {
                                    _user.userInfo.url = imgData.avatar;
                                    defer.resolve(_user.userInfo);
                                }else{
                                    var devicePath = IndexDBService.getDevicePath();
                                    if(devicePath !== null){
                                        var dataPath = devicePath + Constants.globals.usersPath;

                                        $cordovaFile.readAsText(dataPath,_user.userInfo.fileName).then(function (data) {
                                            _user.userInfo.url = "data:image/jpeg;base64," + data;
                                            defer.resolve(_user.userInfo);
                                        }, function (error) {
                                            defer.reject(false);
                                            console.log(error);
                                        });
                                    } 
                                }
                            }, function(error) {
                                defer.reject(false);
                                console.log("get user fail:" + error);
                            });
                    });
                    return defer.promise;
                };
                _user.setUserInfo = function (data) {
                    _user.userInfo = data;
                };

                _user.getUserInfo = function (refresh) {
                    var defer = $q.defer();
                    if(refresh||(_user.userInfo === null || angular.equals({}, _user.userInfo))){
                        _user.getUserFromIndexDB().then(function(userInfo){
                            defer.resolve(userInfo);
                        },function(){
                            defer.reject(false);
                        });
                    }else{
                        defer.resolve(_user.userInfo);
                    }
                   return defer.promise;

                };
            }
        ]);
})();
