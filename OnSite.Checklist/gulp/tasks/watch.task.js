module.exports = function (gulp, g, config) {
    var runSequence = require('run-sequence'); // 定义异步(并行)和同步队列，解除任务间的依赖，增强task复用
    // 监听文件变化
    gulp.task('watch', watchFunc);

    function watchFunc() {
        var JSWatchPath = config.jsPath;
        var ScssWatchPath = config.path + config.scssPath + "/*.scss";
        // compileScss和jshint同步执行，然后和inject异步执行
        runSequence(['compileScss', 'jshint'], 'debugInject'); 

        gulp.watch(JSWatchPath, ['jshint'])
            .on('change',function (evt) {
                if(evt.type !== 'changed') {
                    gulp.start('debugInject');
                }
            })

        gulp.watch(ScssWatchPath, ['compileScss'])
            .on('change',function (evt){
                if(evt.type !== 'changed') {
                    gulp.start('debugInject');
                }
            });
    }
};