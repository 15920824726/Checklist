(function () {
    'use strict';
    angular.module('checklists.core.services')
    	.factory('TempDataService',[
	        function () {
	            var tempData;
	            return {
		            setData: function (data){
		                tempData = data;
		                return;
		            },
		            getData: function () {
		                return tempData;
		            },
		            resetData: function () {
		                    tempData = null;
		            },
		            getRowById: function (id) {
		                angular.forEach(tempData, function (row) {
		                    if(row.id === id){
		                        var tempRow = row;
		                    }
		                });
		             	return tempRow;
		            }
	            };
	        }
    	]);
})();