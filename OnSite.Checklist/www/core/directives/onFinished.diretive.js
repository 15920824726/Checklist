/**
 * Created by eating on 23/02/2017.
 */

(function() {
	'use strict';
	angular.module('checklists.core.directives')
		.directive('onFinishRender', [
			'$timeout',
			function ($timeout) {
				return {
			        restrict: 'A',
			        link: function (scope, element, attr) {
			            if (scope.$last === true) {
			                $timeout(function () {
			                    scope.$emit('ngRepeatFinished');
			                });
			            }
			        }
			    };
			}
		]);
}());
