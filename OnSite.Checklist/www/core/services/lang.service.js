(function (angular) {
    'use strict';
    angular.module('checklists.core.services')
    	.factory('LangService',[
	        function () {
				var globalLanguages = [
				    {
					    	language: 'de', 
					    	languageName: 'German', 
					    	languageName$tr$: 'platform.loginLanguageGerman', 
					    	culture: 'de-de'
					},
				    {
				    		language: 'en', 
				    		languageName: 'English', 
				    		languageName$tr$: 'platform.loginLanguageEnglish', 
				    		culture: 'en-gb'
				    	},
				    {
				    		language: 'zh', 
				    		languageName: 'Chinese', 
				    		languageName$tr$: 'platform.loginLanguageChinese', 
				    		culture: 'zh-cn'
				    	}
				];
	            return {
		            getDefaultLanguageOptions: function () {
		            	var languageOption = {
			        		language:'en',
			            	culture: 'en-gb'
			        	};
						var browserCulture = 'en-gb';
					    if (window.navigator.language) {
					        browserCulture = window.navigator.language;
					    } else if (window.navigator.browserLanguage) {
					        browserCulture = window.navigator.browserLanguage;
					    }
					    for(var index = 0; index < globalLanguages.length; index++) {
					        if (browserCulture.indexOf(globalLanguages[index].language) > -1) {
					            languageOption.language = globalLanguages[index].language;
					            languageOption.culture = browserCulture;
					            break;
					        }
					    }
					    return languageOption;
		            }
	            };
	        }
    	]);
})(angular);