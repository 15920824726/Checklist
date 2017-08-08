(function (angular) {
    'use strict';

    angular.module('checklists.core.services')
    	.factory('UploadDataService', [
    		'$http',
    		'$q',
    		'$filter',
    		'$translate',
            'UserService',
            function (
            $http,
            $q,
            $filter,
            $translate,
            UserService) {
            	var imgData, userInfo;
            	var statusImg = {};
				$http.get("content/img/icon.json")
                    .success(function(data){
         			    imgData = data;
                        statusImg[$translate.instant('common.detected')] = imgData.detected;
                        statusImg[$translate.instant('common.inProgress')] = imgData.inprogress;
                        statusImg[$translate.instant('common.completed')] = imgData.completed;
                        statusImg[$translate.instant('common.rejected')] = imgData.rejected;
     			    });
     			    
     			$http.get("content/font/tff.json")
                    .success(function(data){
         			    window.pdfMake.vfs.fzltxh = data["fzltxh.tff"];
         			    window.pdfMake.fonts = {
         			    		'fzltxh': {
						     normal: 'fzltxh',
						     bold: 'fzltxh',
						     italics: 'fzltxh',
						     bolditalics: 'fzltxh'
						   }
         			    };
     			    });

                UserService.getUserInfo()
                    .then(function(data){
                        userInfo = data;
                });

                var docDefault = {
                    pageSize:'A4',
                    compress: false,
                    content:[
                        {
                            text: $translate.instant('pdf.myChecklists'),
                            style: 'header',
                            margin: [0,20]
                        },
                        {
                            text: $translate.instant('common.project') + ' ' + $translate.instant('common.information'),
                            style: 'header',
                            margin: [0,0,0,20]
                        },
                        {
                            text: $translate.instant('pdf.observer') + ':        ',
                            style: 'item'
                        },
                        {
                            text: $translate.instant('pdf.export') + ' ' + $translate.instant('common.date') + ':     ',
                            style: 'item'
                        }
                    ],
                    styles:{
                        header: {
                            fontSize: 16,
                            bold: true,
                            color: '#009DE6'
                        },
                        subheader: {
                            fontSize: 14,
                            bold: true,
                            margin: [0,10,0,10],
                            color: '#777'
                        },
                        item: {
                            fontSize: 12,
                            bold: false,
                            color: '#000'
                        },
                        tableContent: {
                            fontSize: 12,
                            bold: false,
                            color: '#777'
                        },
                        tableHeader: {
                            margin: [0,5,0,15]
                        },
                        tableTitle: {
                            fontSize: 12,
                            bold: true,
                            color: '#777'
                        }
                    },
                    pageMargins: [ 40, 60, 40, 60 ]
	        	};

                return {
                	pdfData: function(currentProject,list) {
                		var defer = $q.defer();
                        var docDefinition = angular.copy(docDefault);
                        docDefinition.defaultStyle = {
							font: 'fzltxh'
  						};
                        docDefinition.header = {
                            columns: [
                                {
                                    ol: [
                                        {
                                            image: userInfo.url.substring(0,4) != 'data' ? imgData.avatar : userInfo.url,
                                            width: 20,
                                            height: 20
                                        },
                                        {   
                                            text: userInfo.name,
                                            color: '#777',
                                            fontSize: 10,
                                            margin: [0,5]
                                        }
                                    ],
                                    type: 'none'
                                },
                                {
                                    ol: [
                                        {
                                            image: imgData.logo,
                                            width: 60,
                                            height: 25,
                                            alignment: 'right'
                                        },
                                        {   
                                            text: $translate.instant('common.appName'),
                                            color: '#777',
                                            fontSize: 10,
                                            alignment: 'right'
                                        }
                                    ],
                                    type: 'none'
                                }
                            ],
                            margin: [30,20]
                        };
		            	docDefinition.content[2].text = docDefinition.content[2].text + userInfo.name; 
		            	var formatDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		            	docDefinition.content[3].text = docDefinition.content[3].text + formatDate;

		                angular.forEach(list, function(e,i,arr) {
	                		if (!e.hasOwnProperty('folderId')) {
		                		docDefinition.content.push({
		                        	text: e.name,
		                        	margin: [0,20,0,10],
		                        	style: 'header'
		                    	});
		                	} else {
		                		docDefinition.content.push({
	                                text: e.name,
	                                style: 'subheader'
	                            });
                                docDefinition.content.push({
                                    style:'tableHeader',
                                    table:{
                                        headerRows: 1,
                                        dontBreakRows: true,
//												 keepWithHeaderRows: 1,
                                        widths:[60,60,60,'*'],
                                        body:[
                                            [
                                                {text:'OK',style:'tableContent',alignment: 'center'},
                                                {text:'Failed',style:'tableContent',alignment: 'center'},
                                                {text:'NA',style:'tableContent',alignment: 'center'},
                                                {text:'  ',style:'tableContent',alignment: 'center'}
                                            ]
                                        ]
                                    }
                                });
	                            if (e.hasOwnProperty('items')) {
	                            	angular.forEach(e.items, function(item) {
                                        var imagesUrl=[[],[]];
                                        if (angular.isArray(item.image) && item.image.length === 0 || !item.image) {
                                            imagesUrl.push({
                                                text: $translate.instant('pdf.noImg')
                                            });
                                        } else if (angular.isArray(item.image) && item.image.length === 1) {
                                            angular.forEach(item.image,function(picUrl){
                                                imagesUrl[0].push({
                                                    image:picUrl,
                                                    fit:[200,200],
                                                    margin:[5,5,5,5]
                                                });
                                            });
                                        } else if (angular.isArray(item.image) && item.image.length > 1) {
                                            for(var i=0;i<item.image.length;i++){
                                                if(i%2===1){
                                                    imagesUrl[0].push(
                                                        {
                                                            image:item.image[i],
                                                            fit:[200,200],
                                                            margin:[5,5,5,5]
                                                        }
                                                    );
                                                }else{
                                                    imagesUrl[1].push(
                                                        {
                                                            image:item.image[i],
                                                            fit:[200,200],
                                                            margin:[5,5,5,5]
                                                        }
                                                    );
                                                }

                                            }
                                        }else {
                                            console.log('create imagesUrl error');
                                        }
	                            		var doc = {
		                                    style:'tableHeader',
		                                    table:{
		                                        widths: [60,60,60,'*'],
		                                        body: [
                                                    // row 1
                                                    [
                                                        {
                                                            image: item.ok?imgData.ok:imgData.blank,
                                                            width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
                                                        },
                                                        {
                                                            image: item.fail?imgData.fail:imgData.blank,
                                                            width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
                                                        },
                                                        {
                                                            image: item.na?imgData.na:imgData.blank,
                                                            width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
                                                        },
                                                        {
                                                            text: item.name ? item.name : ' ',
                                                            style: 'tableContent',
                                                            alignment: 'center',
                                                            margin: [0,5]
                                                        }
                                                    ],
                                                    // row 2
		                                            [
                                                        {
                                                        	text:' ',
                                                        	colSpan: 4
                                                        },'','',''
                                                    ],
                                                    // row 3
		                                            [
		                                                {
		                                                    image: imgData.note,
		                                                    width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
		                                                },
		                                                {
                                                            table:{
                                                                width: [400],
                                                                body:[
                                                                    [item.note ? item.note : $translate.instant('pdf.noNote')]
                                                                ]
                                                            },
                                                            layout: 'noBorders',
                                                            colSpan: 3
                                                        },'',''
		                                            ],
                                                    // row 4
		                                            [
		                                                {
		                                                    image: imgData.img,
		                                                    width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
		                                                },
		                                                {
                                                            table: {
                                                                width:[400],
                                                                body:[imagesUrl]
                                                            },
                                                            layout: 'noBorders',
                                                            colSpan: 3
                                                        },'',''
		                                            ],
                                                    // row 5
		                                            [
		                                                {
		                                                    image: imgData.file,
		                                                    width: 30,
                                                            colSpan: 1,
                                                            alignment: 'center'
		                                                },
		                                                {
		                                                	text: $translate.instant('pdf.noFile'),
		                                                	colSpan: 3
		                                                },'',''
		                                            ]
		                                        ]
		                                    }
		                                };
		                                docDefinition.content.push(doc);
		                            });
	                            }
		                	}
		                	if (i === arr.length - 1) {
		                		defer.resolve(docDefinition);
		                	}
		                });
						return defer.promise;
	                }
                };
            }
        ]
    );
})(angular);