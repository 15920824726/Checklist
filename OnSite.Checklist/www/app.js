/**
 * Created by eating on 3/1/2017.
 */
(function (angular) {
    'use strict';
    window.ApplicationConfiguration = (function() {
        // Init module configuration options
        var applicationModuleName = 'checklists';
        var applicationModuleVendorDependencies = ['ionic', 'toastr', 'pascalprecht.translate', 'ngCordova', 'pdf'];

        // Add a new vertical module
        var registerModule = function(moduleName) {
            // Create angular module
            angular.module(moduleName, []);

            // Add the module to the AngularJS configuration file
            angular.module(applicationModuleName).requires.push(moduleName);
        };

        return {
            applicationModuleName: applicationModuleName,
            applicationModuleVendorDependencies: applicationModuleVendorDependencies,
            registerModule: registerModule
        };
    })();
    var checklists = angular.module('checklists', [
        'ionic',
        'toastr',
        'pascalprecht.translate',
        'ngCordova',
        'pdf',
        'checklists.core',
        'components'
    ]);
    checklists
        .config(['$ionicConfigProvider',
            '$stateProvider',
            '$urlRouterProvider',
            '$translateProvider',
            'toastrConfig',
            function ($ionicConfigProvider,
                      $stateProvider,
                      $urlRouterProvider,
                      $translateProvider,
                      toastrConfig) {
            	
            	$ionicConfigProvider.platform.ios.tabs.style('standard');
                $ionicConfigProvider.platform.ios.tabs.position('bottom');
                
                $ionicConfigProvider.platform.android.tabs.style('standard');
                $ionicConfigProvider.platform.android.tabs.position('standard');
                
                $ionicConfigProvider.platform.ios.views.transition('ios');
                $ionicConfigProvider.platform.android.views.transition('android');
                
                $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
                $ionicConfigProvider.platform.android.navBar.alignTitle('center');
                
                $ionicConfigProvider.platform.android.form.checkbox('circle');
                $ionicConfigProvider.platform.android.form.toggle('large');

                //$ionicConfigProvider.platform.ios.scrolling.jsScrolling(false);
                $ionicConfigProvider.platform.android.scrolling.jsScrolling(true);
                
                $ionicConfigProvider.views.swipeBackEnabled(false);
                
                //$ionicConfigProvider.views.maxCache(0);
	            
	            $translateProvider.useLoader('$translatePartialLoader', 
	            		{urlTemplate:'content/i18n/{lang}.json'});
	            $translateProvider.preferredLanguage("en");
	            $translateProvider.fallbackLanguage("en");
	            $translateProvider.translationNotFoundIndicator('X');
                
                var toastrPosition = 'toast-bottom-right';
                if (window.screen) {
                    if (window.screen.width < 768) {
                        toastrPosition = 'toast-bottom-center';
                    }
                }
                angular.extend(toastrConfig, {
	                progressBar: false, 
	                closeButton: false, 
	                maxOpened: 0,
	                newestOnTop: true,
	                positionClass: toastrPosition,
	                preventDuplicates: false, 
	                preventOpenDuplicates: true,
	                target: 'body',
	                timeOut: 1500
	            });
             
                $urlRouterProvider.otherwise("/lists");
            }
        ])
        .run(['$ionicPlatform',
            '$rootScope',
            '$translate',
            '$cordovaDevice',
            '$cordovaStatusbar',
            'LangService',
            'TranslateService',
            function($ionicPlatform,
                     $rootScope,
                     $translate,
                     $cordovaDevice,
                     $cordovaStatusbar,
                     LangService,
                     TranslateService) {
                $ionicPlatform.ready(function() {
                    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                    // for form inputs).
                    if (window.screen) {
                 		if (window.screen.width < 768 && window.screen.orientation) {
                 			window.screen.orientation.lock('portrait');
                 			if (window.screen.width < window.screen.height) {
                 				$rootScope.clientWidth = window.screen.width;
                 			} else {
                 				$rootScope.clientWidth = window.screen.height;
                 			}
                 		}
                    }
                    if (window.cordova) {
                        if (window.cordova.plugins.Keyboard) {
                            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                            cordova.plugins.Keyboard.disableScroll(true);
                        }
                        if ($cordovaDevice) {
                            $rootScope.device = $cordovaDevice.getDevice();
                            if ($rootScope.device.platform == 'IOS') {
                                $rootScope.platformType = 1;
                                if (window.StatusBar) {
                                    // Set the statusbar to use the default style, tweak this to
                                    // remove the status bar on iOS or change it to use white instead of dark colors.
                                    $cordovaStatusbar.styleColor('white');
                                }
                            } else if($rootScope.device.platform == 'Android') {
                                $rootScope.platformType = 2;
                            }
                        }
                    }
                });

                TranslateService.registerModule('/');
                var langOpt = LangService.getDefaultLanguageOptions();
		        if (langOpt) {
		        	$translate.use(langOpt.language);
		        }
            }
        ]);   
}(angular));