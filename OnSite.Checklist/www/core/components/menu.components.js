/**
 * Created by eating on 06/04/2017.
 */

(function() {
	'use strict';
	angular.module('components.menu', [])
		.service('menuCtrl', menuCtrlService)
		.directive('menuBtn', menuBtnDirective);

    function menuCtrlService () {					
    	var mainLeft, mainContent, mainRight;

		function toggleLeftMenu(act) {
			mainLeft = angular.element(document.getElementById('mainLeft'));
			mainContent = angular.element(document.getElementById('mainContent'));
			if (act && act == 'open') {
				mainLeft.addClass('open-left');
				mainContent.addClass('open-left-cont');		
			} else {
				mainLeft.toggleClass('open-left');
				mainContent.toggleClass('open-left-cont');
			}											
			toggleRightMenu('close');				
		}
		
		function toggleRightMenu(act) {
			mainLeft = angular.element(document.getElementById('mainLeft'));
			mainContent = angular.element(document.getElementById('mainContent'));
			mainRight = angular.element(document.getElementById('mainRight'));	
			if (act == 'close') {								
				mainContent.removeClass('open-right-cont');
				mainRight.removeClass('open-right');
			} else if (act == 'open') {	
				mainLeft.removeClass('open-left');
				mainContent.removeClass('open-left-cont');
				mainContent.addClass('open-right-cont');
				mainRight.addClass('open-right');
			}
		}

		return {
			toggleLeftMenu: function(act) {
				toggleLeftMenu(act);
			},
			toggleRightMenu: function(act) {
				toggleRightMenu(act);
			},
		};	
    }

    menuBtnDirective.$inject = ['menuCtrl'];
	function menuBtnDirective(menuCtrl) {
		return {
	        restrict: 'AE',
	        link: function (scope, element, attr) {
	        	// position left or right
	            var posn = attr.posn || null;
	            // open or close 
	            var act = attr.act || null;					
								
				if (posn) {
					element.on("click", function () {
                        if (posn == 'left') {	                          	
                        	menuCtrl.toggleLeftMenu(act);	                            	
                        } else if (posn == 'right') {
                        	menuCtrl.toggleRightMenu(act);
                        }
                    });
				}
			}
		};
	}
}());
