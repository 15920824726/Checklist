/**
 * Created by gam on 1/6/2017.
 */
(function (angular) {
    'use strict';
    var moduleName = 'checklists.core.services';
    angular.module(moduleName)
        .factory('StorageService', [
            function () {
                var service = {};
                service.getStore = function (type) {
                    return type === 'private' ? sessionStorage : localStorage;
                };
                service.getItem = function (type,key) {
                    var store = this.getStore(type), data;
                    data = store.getItem(key);
                    if(typeof data === 'string' && data.indexOf('{') >=0 ){
                        data = JSON.parse(data);
                    }
                    if(data){
                        return data;
                    }else{
                        return null;
                    }
                };
                service.setItem = function (type,key,data) {
                    if(!data){
                        return ;
                    }else{
                       var store = this.getStore(type);
                        if(typeof data === 'object'){
                            data = JSON.stringify(data);
                        }
                        if(typeof data === 'string' || typeof data === 'number'){
                            store.setItem(key,data);
                            return true;
                        }
                        return false;
                    }
                };
                service.removeItem = function (type,key) {
                    var store = this.getStore(type);
                    store.removeItem(key);
                };
                service.clearAllStore = function () {
                    var store = this.getStore(type);
                    store.clear();
                };
                return service;
            }
        ]);
})(angular);