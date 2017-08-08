(function(angular){
    'use strict';
    angular.module('checklists.core.services')
        .factory('IndexDBService',[
            '$q',
            '$rootScope',
            '$cordovaFile',
            '$cordovaImagePicker',
            '$cordovaCamera',
            'toastr',
            'Constants',
            '$translate',
            '$cordovaDevice',
            function ($q,$rootScope,$cordovaFile,$cordovaImagePicker,$cordovaCamera,toastr,Constants,$translate,$cordovaDevice) {
                var service        = {};
                var indexedDB      = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
                    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
                    readWriteMode  = typeof IDBTransaction.READ_WRITE == "undefined" ? "readwrite" : IDBTransaction.READ_WRITE;
                    
                //db default (mary)
                var config = {
                    dbShortName: 'OnsiteChecklists',
                    version: 1,
                    storeList: [
                        {
                            name: 'users',
                            id: 1,
                            key: 'id'
                        },
                        {
                            name: 'projects',
                            id: 2,
                            key: 'id'
                        },
                        {
                            name: 'folders',
                            id: 3,
                            key: 'id'
                        },
                        {
                            name: 'lists',
                            id: 4,
                            key: 'id'
                        },
    					{
                            name: 'items',
                            id: 5,
                            key: 'id'
                        },
                        {
                            name: 'pictures',
                            id: 6,
                            key: 'id'
                        },
                        {
                            name: 'cloud',
                            id: 7,
                            key: 'id'
                        },
                    ]
                };

                //open db (mary)
                service.openDB = function(){
                    var DBName = config.dbShortName;
                    var deferred = $q.defer();
                    var request = window.indexedDB.open(DBName);
                    var db = null;
                    var storeName,key;

                    request.onsuccess = function(e){
                        config.currentDbObj = e.target.result;
                        deferred.resolve({
                            request: request,
                            db:db
                        });
                    };

                    request.onerror = function(e){
                        //this.errorHandler();
                        deferred.reject(false);
                    };

                    request.onupgradeneeded = function(e) {
                        var db = e.target.result;
                        config.storeList.forEach(function(item){
                            storeName = item.name;
                            key = item.key;
                            if (!db.objectStoreNames.contains(storeName)) {
                                var store = db.createObjectStore(storeName, {keyPath: key,autoIncrement: true});
                                store.createIndex('idIndex','id',{unique: true});
                                if(storeName != 'pictures'){
                                    if(storeName == 'projects'){
                                        store.createIndex('nameIndex','name',{unique: true});
                                    }else{
                                        store.createIndex('nameIndex','name',{unique: false});
                                    }                                    
                                    if(storeName == 'lists'){
                                    	store.createIndex('projectIdIndex','projectId',{unique: false});
                                        store.createIndex('folderIdIndex','folderId',{unique: false});
                                        store.createIndex('searchIndex',['categoryId','typeId','statusId'],{unique: false});
                                    }else if(storeName == 'folders'){
                                        store.createIndex('projectIdIndex','projectId',{unique: false});
                                    }else if(storeName == 'items'){
                                    		store.createIndex('projectIdIndex','projectId',{unique: false});
                                        store.createIndex('folderIdIndex','folderId',{unique: false});
                                        store.createIndex('listIdIndex','listId',{unique: false});
                                    }
                                }else{
                                    store.createIndex('itemIdIndex','itemId',{unique: false});
                                    store.createIndex('fileNameIndex','fileName',{unique: false});
                                }

                            }
                        });
                    };
                    return deferred.promise;
                };
                
                var users = [
                		{name: 'admin',id: 1}
                ];
                service.openDB().then(function () {
                    service.addData('users', users);
                }, function (error) {
                    console.log(error);
                });

                //close db (mary)
                service.closeDB = function(){
                    var DBName = config.dbShortName;
                    DBName.close();
                };

                //delete db (mary)
                service.deleteDB = function(){
                    var DBName = config.dbShortName;
                    try{
                        indexedDB.deleteDatabase(DBName);
                        return true;
                    }catch (e){
                        console.log(e.getMessage);
                        return false;
                    }
                };

                //add one data (mary)
                service.addDataItem = function(storeName,data){
                    var defer = $q.defer();
                    var store = service.getStore(storeName);
                    var request = store.put(data);
                    request.onsuccess = function (e) {
                        defer.resolve(e.target.result);
                        toastr.success($translate.instant('common.success'));
                    };
                    request.onerror = function (e) {
                        console.log(e);
                        defer.reject(false);
                        toastr.error($translate.instant('error.name2msg',{name:e.target.error.name,msg:e.target.error.message}));
                    };
                    return defer.promise;
                };
                //add one data (mary)
                service.updateDataByKey = function(storeName,id,key,data){
                    var defer = $q.defer();
                    var store = service.getStore(storeName);
                    var request = store.get(id);
                    request.onsuccess = function(e){
                        var result=e.target.result;
                        result[key] = data;
                        store.put(result);
                        defer.resolve(true);
                    };
                    request.onerror = function(e){
                        console.log(e);
                        defer.reject(false);
                        toastr.error($translate.instant('error.name2msg',{name:e.target.error.name,msg:e.target.error.message}));
                    };
                    return defer.promise;
                };
                //add more data (mary)
                service.addData = function(storeName,data){
                    var store = this.getStore(storeName);
                    data.forEach(function(item){
                        store.add(item);
                    });
                };

                //need to fix by neal
                service.createIndex = function(storeName,indexArr){
                    var defer = $q.defer();
                    var db = null;
                    var request = window.indexedDB.open(config.dbShortName);
                    request.onerror = function(e){
                        console.log(e.target.errorCode);
                    };
                    request.onsuccess = function(e){
                        config.currentDbObj = e.target.result;
                        defer.resolve({
                            request: request,
                            db:db
                        });
                        var store = db.getStore(storeName);
                        store.createIndex('seachIndex',indexArr,{unique: false});
                    };
                    request.onupgradeneeded = function(e) {
                        var db = e.target.result;
                        var store = db.getStore(storeName);
                        store.createIndex('searchIndex',indexArr,{unique: false});
                    };
                };
                var dataURItoBlob = function(dataURI) {
                    // convert base64/URLEncoded data component to raw binary data held in a string
                    var byteString;
                    if (dataURI.split(',')[0].indexOf('base64') >= 0)
                        byteString = atob(dataURI.split(',')[1]);
                    else
                        byteString = unescape(dataURI.split(',')[1]);

                    // separate out the mime component
                    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                    // write the bytes of the string to a typed array
                    var ia = new Uint8Array(byteString.length);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    return new Blob([ia], {
                        type: mimeString
                    });
                };
                //set item image to pictures stores (mary)
                service.setPicturePc = function (itemId,dataURL) {
                    var data = {
                        itemId: itemId,
                        blob: dataURItoBlob(dataURL)
                    };
                    var db = config.currentDbObj;
                    // Put the received blob into IndexedDB
                    // Open a transaction to the database
                    var transaction = db.transaction(["pictures"], readWriteMode);
                    // Put the blob into the dabase
                    transaction.objectStore("pictures").add(data);//
                };
                //set item picture to pictures stores (mary)
                service.setPicture = function (itemId,fileName) {
                    var defer = $q.defer();
                    var data = {
                        itemId: itemId,
                        fileName: fileName
                    };
                    var db = config.currentDbObj;
                    // Put the received blob into IndexedDB
                    // Open a transaction to the database
                    var transaction = db.transaction(["pictures"], readWriteMode);
                    var request = transaction.objectStore("pictures").add(data);
                    request.onsuccess = function (e) {
                        defer.resolve(true);                    
                    };
                    request.onerror = function (e) {
                        console.log(e);
                        defer.reject(false);                    
                    };
                    return defer.promise;
                };
                service.createDir = function(path,dirName){
                    var defer = $q.defer();
                    $cordovaFile.checkDir(path, dirName)
                        .then(function (success) {
                            defer.resolve(true);
                        }, function (error) {
                            // 创建目录
                            $cordovaFile.createDir(path, dirName, false)
                                .then(function (success) {
                                    defer.resolve(true);
                                }, function (error) {
                                    defer.reject(false);
                                    console.log(error);
                                });
                            //创建文件
                        });
                    return defer.promise;
                };

                //get store (mary)
                service.getStore = function(storeName){
                    var db = config.currentDbObj;
                    var transaction = db.transaction(storeName,readWriteMode);
                    var store       = transaction.objectStore(storeName);
                    return store;
                };

                //get data by key (mary)
                service.getDataByKey = function(storeName,value){
                    var defer = $q.defer();
                    var store = this.getStore(storeName);
                    var request = store.get(value);
                    request.onsuccess = function(e){
                        var result = e.target.result;
                        defer.resolve(result);
                    };
                    request.onerror = function(e){
                        console.log(e);
                        defer.reject(false);
                    };
                    return defer.promise;
                };

                //get data by index (mary)
                service.getDataByIndex = function(storeName,DBindex,value){
                    var defer = $q.defer();
                    var store = service.getStore(storeName);
                    var index = store.index(DBindex);
                    var request = index.get(value);
                    request.onsuccess = function(e){
                        var result = e.target.result;
                        defer.resolve(result);
                    };
                    request.onerror = function (e) {
                        console.log(e);
                        defer.reject(false);
                    };
                    return defer.promise;
                };

                //get data by cursor (mary)
                service.fetchStoreByCursor = function(storeName){
                    var defer = $q.defer();
                    var result = [];
                    var store = this.getStore(storeName);
                    var request = store.openCursor();
                    request.onsuccess = function(e){
                        var cursor = e.target.result;
                        if(cursor){
                            result.push(cursor.value);
                            cursor.continue();
                        }else{
                            defer.resolve(result);
                        }
                    };
                    request.onerror = function (e) {
                        console.log('error ' + e);
                        request.inject(null);
                    };
                    return defer.promise;
                };
                
                //query data
                service.fuzzyQueryData = function(storeName,indexName,value){
                    var defer = $q.defer();
                    var result = [];
                    var store = this.getStore(storeName);
                    var index = store.index(indexName);
                    var search = IDBKeyRange.bound(value, value + '\uffff', false, false);
                    var request = index.openCursor(search);
                    request.onsuccess = function(e){
                        var cursor = e.target.result;
                        if(cursor){
                            result.push(cursor.value);
                            cursor.continue();
                        }else{
                            defer.resolve(result);
                        }
                    };
                    request.onerror = function (e) {
                        console.log('error ' + e);
                        request.$inject(null);
                    };
                    return defer.promise;
                };

                //get data by index and key (mary)
                service.getMultipleData = function(storeName,indexName,value){
                    var defer = $q.defer();
                    var result = [];
                    var store = this.getStore(storeName);
                    var index = store.index(indexName);
                    var request = index.openCursor(IDBKeyRange.only(value));
                    request.onsuccess = function(e){
                        var cursor = e.target.result;
                        if(cursor){
                            result.push(cursor.value);
                            cursor.continue();
                        }else{
                            defer.resolve(result);
                        }
                    };
                    request.onerror = function (e) {
                        console.log('error ' + e);
                        request.$inject(null);
                    };
                    return defer.promise;
                };

                // get all item pictures by item id(mary)
                service.getAllPictures = function (itemId) {
                    var defer = $q.defer();
                    service.getMultipleData('pictures','itemIdIndex',itemId).then(function (response) {
                        defer.resolve(response);
                    },function (e) {
                       console.log('search image error form pictures store');
                        defer.reject(false);
                    });
                    return defer.promise;
                };

                // delete data by key (mary)
                service.deleteDataByKey = function (storeName,id) {
                    var defer = $q.defer();
                    id = parseInt(id);
                    var store = service.getStore(storeName);
                    var request = store.delete(id);
                    request.onsuccess = function (e) {
                        defer.resolve(true);
                    };
                    request.onerror = function (e) {
                        console.log(e);
                        defer.reject(false);
                    };
                    return defer.promise;
                };
                service.delPicture = function (id,fileName) {
                    var name = fileName;
                    id = parseInt(id);
                    var defer = $q.defer();
                    var devicePath = service.getDevicePath();
                    var dataPath = devicePath + Constants.globals.picturePath;

                    $cordovaFile.removeFile(dataPath, name)
                        .then(function (success) {
                            // success
                            service.deleteDataByKey('pictures',id).then(function (response) {
                                defer.resolve(true);
                            },function (e) {
                                console.log(e);
                                defer.reject(false);
                            });
                        }, function (error) {
                            // error
                            console.log(error);
                            defer.reject(false);
                        });
                    return defer.promise;
                };
                // delete picture by item id (mary)
                service.deletePicturesByItemId = function (itemId) {
                    var id = parseInt(itemId);
                    var defer = $q.defer();
                    var len = 0;
                    //get all pictures
                    service.getMultipleData('pictures','itemIdIndex',id).then(function (pictures) {
                        var itemLen = pictures.length;
                        console.log(pictures);
                        if(itemLen>0){
                            //for pictures
                            pictures.forEach(function (item) {
                                len++;
                                //delete image
                                service.delPicture(item.id,item.fileName).then(function (response) {
                                    if(len == itemLen){
                                        defer.resolve(true);
                                    }
                                },function (e) {
                                    console.log(e);
                                    defer.reject(false);
                                });
                            });
                        }else{
                            defer.resolve(true);
                        }
                    },function (e) {
                        console.log('search picture error form pictures store');
                        defer.reject(false);
                    });

                    return defer.promise;
                };

                // delete item by item id (mary)
                service.deleteItem = function (id) {
                    id = parseInt(id);
                    var defer = $q.defer();

                    service.deletePicturesByItemId(id).then(function (isDelImage) {
                        if(isDelImage){
                            service.deleteDataByKey('items',id).then(function (response) {
                                console.log('delete item success!');
                                defer.resolve(true);
                            },function (e) {
                                defer.reject(false);
                                console.log('delete item error!');
                            });
                        }else{
                            defer.reject(false);
                        }
                    },function (e) {
                       console.log('delete pictures error!');
                    });
                    return defer.promise;
                };

                // delete item by list id (mary)
                service.deleteItemByListId = function (listId) {
                    var defer = $q.defer();
                    var len = 0;
                    //get all pictures
                    service.getMultipleData('items','listIdIndex',listId).then(function (items) {
                        var itemLen = items.length;
                        if(itemLen>0){
                            //for pictures
                            items.forEach(function (item) {
                                len++;
                                //delete item
                                service.deleteItem(item.id).then(function (response) {
                                    if(len == itemLen){
                                        defer.resolve(true);
                                    }
                                },function (e) {
                                    console.log(e);
                                    defer.reject(false);
                                });
                            });
                        }else{
                            defer.resolve(true);
                        }
                    },function (e) {
                        console.log('search image error form pictures store');
                        defer.reject(false);
                    });

                    return defer.promise;
                };

                // delete list by list id (mary)
                service.deleteList = function (id) {
                    var listId = parseInt(id);
                    var defer = $q.defer();
                    service.deleteItemByListId(listId).then(function (isDelItem) {
                        if(isDelItem){
                            service.deleteDataByKey('lists',listId).then(function (response) {
                                console.log('delete list success!');
                                defer.resolve(true);
                            },function (e) {
                                defer.reject(false);
                                console.log('delete list error!');
                            });
                        }else{
                            defer.reject(false);
                        }
                    },function (e) {
                        console.log('delete items error!');
                    });
                    return defer.promise;
                };

                // delete lists by folder id
                service.deleteListsByFolderId = function (folderId) {
                    var defer = $q.defer();
                    var len = 0;
                    //get all lists
                    service.getMultipleData('lists','folderIdIndex',folderId).then(function (lists) {
                        var itemLen = lists.length;
                        if (itemLen>0) {
                            //for pictures
                            lists.forEach(function (item) {
                                len ++;
                                //delete item
                                service.deleteList(item.id).then(function (response) {
                                    if(len === itemLen){
                                        defer.resolve(true);
                                    }
                                }, function (e) {
                                    console.log(e);
                                    defer.reject(false);
                                });
                            });
                        } else {
                            defer.resolve(true);
                        }
                    }, function (e) {
                        console.log('search list error form lists store');
                        defer.reject(false);
                    });
                    return defer.promise;
                };
                
                // delete folder by folder id
                service.deleteFolder = function (id) {
                    var folderId = parseInt(id);
                    var defer = $q.defer();
                    service.deleteListsByFolderId(folderId).then(function (isDelItem) {
                        if (isDelItem) {
                            service.deleteDataByKey('folders',folderId).then(function (response) {
                                console.log('delete folder success!');
                                defer.resolve(true);
                            }, function (e) {
                                defer.reject(false);
                                console.log('delete folder error!');
                            });
                        } else {
                            defer.reject(false);
                        }
                    },function (e) {
                        console.log('delete lists error!');
                    });
                    return defer.promise;
                };
                
                // delete folders by project id
                service.deleteFoldersByProjectId = function (projectId) {
                    var defer = $q.defer();
                    var len = 0;
                    //get all folders
                    service.getMultipleData('folders','projectIdIndex', projectId).then(function (folders) {
                        var itemLen = folders.length;
                        if (itemLen>0) {
                            //for pictures
                            folders.forEach(function (item) {
                                len ++;
                                //delete item
                                service.deleteFolder(item.id).then(function (response) {
                                    if(len === itemLen){
                                        defer.resolve(true);
                                    }
                                }, function (e) {
                                    console.log(e);
                                    defer.reject(false);
                                });
                            });
                        } else {
                            defer.resolve(true);
                        }
                    }, function (e) {
                        console.log('search folder error form folders store');
                        defer.reject(false);
                    });

                    return defer.promise;
                };

                // delete project by project id (mary)
                service.deleteProject = function (id) {
                    var projectId = parseInt(id);
                    var defer = $q.defer();
                    service.deleteFoldersByProjectId(projectId).then(function (isDelItem) {
                        if(isDelItem){
                            service.deleteDataByKey('projects',projectId).then(function (response) {
                                console.log('delete project success!');
                                defer.resolve(true);
                            },function (e) {
                                defer.reject(false);
                                console.log('delete project error!');
                            });
                        }else{
                            defer.reject(false);
                        }
                    },function (e) {
                        console.log('delete folders error!');
                    });
                    return defer.promise;
                };
                service.getDevicePath = function() {
                    var devicePath = null;                   

                    if ($cordovaDevice.getDevice().platform == 'Android'){
                        devicePath = cordova.file.applicationStorageDirectory;
                    } else if ($cordovaDevice.getDevice().platform.toUpperCase() == 'IOS'){
                        devicePath = cordova.file.dataDirectory;
                    } else {    
                        toastr.error("Device is not android or IOS");
                    }
                    return devicePath;
                };
                return service;
            }
        ]);
})(angular);