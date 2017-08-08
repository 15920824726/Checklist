npm // -----------
全局安装node、ionic

全局安装bower、gulp
npm install -g bower/gulp

本地安装依赖包
npm install 
bower install

交互式设置package和bower
npm init
bower init

本地更新依赖包
bower update
npm update

本地安装依赖包
npm install xxx --save-dev
bower install xxx --save-dev

还原开发环境
下载cordova plugins
ionic state restore

启动gulp任务
gulp serve

// -----------
目录说明：
├ root
│	└ hook 					--cordova自动化工程
│	└ gulp 					--gulp任务代码
│	└ lib 					--bower外置库
│	└ www 					--项目开发代码
│	│	└ assets			--静态资源文件
│	│	└ core	  			--核心模块代码
│	│	│	└ components	--组件
│	│	│	└ constants 	--常量
│	│	│	└ directives	--指令
│	│	│	└ filters   	--过滤器
│	│	│	└ interceptors	--拦截器
│	│	│	└ services 		--服务
│	│	│	└ core.js 		--核心模块入口						
│	│	└ lib	  			--外部资源库
│	│	└ module			--业务模块代码
│	│	│	└ [模块名] 		--模块
│	│	│	│	└ views 	--模块静态页
│	│	│	│	└ [控制名]	--模块控制器					
│	│	│	└ module.js 	--业务模块入口	
│	│	└ scss          	--scss源文件
│	│	└ app.js 			--项目入口
│	│	└ index.html 		--项目启动页
│   └ .bowerrc 				--bower默认设置
│   └ bower.json 			--bower配置文件
│   └ config.xml      		--app设置文件
│   └ gulpfile.js     		--gulp任务入口
│   └ ionic.config.json		--ionic设置文件
│   └ package.json 			--npm配置文件
│   └ README.md 			--说明文档

// -----------
路由说明：
├  default
│	└ lists
│	│	└ items
│	│	└ dashboard
│	└ projects
│	└ share

// -----------
视图说明：
 _____________________body__________________________________________
│  ____left____________   ________content_____	  ____right______ │
│ │  ___tabs_______  │ │  ______________  │ │             │ │
│ │ │   ______   │ │ │ │            │ │ │             │ │
│ │ │ │list  │ │ │ │ │  desktop   │ │ │             │ │
│ │ │ │______│ │ │ │ │            │ │ │             │ │
│ │ │____________│ │ │ │____________│ │ │             │ │
│ │__________________│ │__________________│ │_____________│ │
│_________________________________________________________________│

	




