(function() {
    'use strict';
    angular.module('checklists.core.directives')
        .directive('showLoader', [
            '$rootScope',
            '$ionicBackdrop',
            function (
            $rootScope,
            $ionicBackdrop) {
                return {
                    restrict:'E',
                    template:
                        '<ion-spinner icon="ios"></ion-spinner>',
                    link: function (scope, element, attrs) {

                        var windowWidth = angular.element(window)[0].innerWidth;
                        var windowHeight = angular.element(window)[0].innerHeight;

                        element.attr('style',
                            'left:' + (windowWidth - element[0].offsetWidth)/2 +'px;' + 'top:' + (windowHeight - element[0].offsetHeight)/2 +'px'
                        );
                        
                        $rootScope.$watch('showLoading', function(data){
                            if (data) {
                                $ionicBackdrop.retain();
                            } else {
                                $ionicBackdrop.release();
                            }
                        });
                    }
                };
            }
        ]);
}());
