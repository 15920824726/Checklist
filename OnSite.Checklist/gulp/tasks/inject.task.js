module.exports = function (gulp, g, config) {
    /* *
     * 往index页面注入项目引用的js和css
     * 其中包括bower管理里面引用的第三方库
     * 在这里我们用main-bower-files插件去读取bower.json里面的overrides字段
     * 获取我们引用的第三库的核心文件，注入到我们的index页面中
     * */

    var mainBowerFiles = require('main-bower-files'),
        es = require('event-stream');

    // 开发模式
    gulp.task('debugInject', debugInjectFunc);

    function debugInjectFunc() {
        var bowerFiles = gulp.src(mainBowerFiles({includeDev: true, read: false}),{base: 'path/to/lib'})
            .pipe(gulp.dest(config.path + config.scriptsPath + '/lib')),
            
            libJsFiles = gulp.src(config.libJsPath, {read: false}),
            // 根据angular的注入顺序引入
            coreJsFiles = gulp.src(config.coreJsPath).pipe(g.angularFilesort()), 
            moduleJsFiles = gulp.src(config.moduleJsPath, {read: false}),
            cssFile = gulp.src(config.cssPath, {read: false});

        return gulp.src(config.path + '/index.html')
            .pipe(g.inject(es.merge(bowerFiles, libJsFiles), {relative: true, name: 'bower'}))
            .pipe(g.inject(es.merge(coreJsFiles, moduleJsFiles, cssFile), {relative: true}))
            .pipe(gulp.dest(config.path))
    };

    // 发布模式
    gulp.task('releaseInject', releaseInjectFunc);

    function releaseInjectFunc() {

    }

};