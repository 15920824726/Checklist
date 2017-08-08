(function () {
    'use strict';
    angular.module("checklists.core.services")
        .service("PictureService", [
            "$rootScope",
            "$q",
            '$cordovaDevice',
            '$cordovaCamera',
            "$cordovaFile",
            "IndexDBService",
            "Constants",
            "UserService",
            function (
                $rootScope,
                $q,
                $cordovaDevice,
                $cordovaCamera,
                $cordovaFile,
                IndexDBService,
                Constants,
                UserService) {
                var service = {                    
                    userStorePicture: function(userid,fileName){
                        IndexDBService.openDB().then(function () {
                            IndexDBService.updateDataByKey('users',userid,'fileName',fileName).then(function(){
                                UserService.getUserInfo(true).then(function(userInfo){ });
                            });
                        });
                    },
                    itemStorePicture: function(id,name){
                        IndexDBService.setPicture(id,name).then(function (response) {
                            $rootScope.$emit('getPicture',{itemId: id});
                        });
                    },
                    writeFile: function(options){
                        // WRITE
                        $cordovaFile.writeFile(options.dataPath, options.fileName, options.data, true)
                        .then(function (success) {
                            // success
                            //console.log(success);
                            if(options.storeName == 'users'){
                                service.userStorePicture(options.id,options.fileName);
                            }else if(options.storeName == 'items'){
                                service.itemStorePicture(options.id,options.fileName);
                            }
                            
                        }, function (error) {
                            // error
                            console.log(error);
                        });
                    },
                    createFile: function(options){   
                        console.log(options);
                        var param = {
                            dataPath: options.dataPath,
                            fileName: options.fileName,
                            storeName: options.storeName,
                            id: options.id
                        };
                        $cordovaFile.checkFile(param.dataPath, param.fileName)
                        .then(function (success) {
                            // success
                            service.writeFile(param);
                        }, function (error) {
                            // error
                            $cordovaFile.createFile(param.dataPath, param.fileName, true)
                            .then(function (success) {
                                // success
                                //console.log(success);
                                service.writeFile(param);
                                
                            }, function (error) {
                                // error
                                console.log(error);
                            });
                        });             
                        
                    },
                    takePhoto: function(param) {
                        var targetWidth,targetHeight;
                        if(param.storeName == 'users'){
                            targetWidth = 200;
                            targetHeight = 200;
                        }else{
                            targetWidth = 800;
                            targetHeight = 800;
                        }

                        var options = {
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: param.sourceType,
                            allowEdit: false,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            saveToPhotoAlbum: false
                        };

                        $cordovaCamera.getPicture(options).then(function(picture) {
                            var devicePath = IndexDBService.getDevicePath();
                            var dataPath;
                            if(devicePath !== null){

                                if(param.storeName == 'users'){
                                    dataPath = devicePath + Constants.globals.usersPath;
                                }else{
                                    dataPath = devicePath + Constants.globals.picturePath;
                                }

                                var fileName;
                                if(param.storeName == 'users'){
                                    fileName = param.id;
                                }else{
                                    fileName = new Date().getTime();
                                }

                                service.writeFile({
                                    id: param.id,
                                    data: picture,
                                    dataPath: dataPath,
                                    storeName: param.storeName,
                                    fileName: fileName + '.txt',
                                });
                            }                           
                        }, function(err) {
                          // An error occurred. Show a message to the user
                        });
                    }
                };
                return service;
            }
        ]);
})();