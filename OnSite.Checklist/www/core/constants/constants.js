(function() {
    'use strict';
    angular.module('checklists')
        .constant('Constants', {
            globals: {
			    dataPath: '/data',
			    picturePath: '/data/picture',
			    usersPath:'/data/users'
			},
			regRule: {
                nametest:/[\w\u4e00-\u9fa5]/,
            }
        });
}());
