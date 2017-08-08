module.exports = function (gulp, g, config) {
    var browserSync = require('browser-sync').create()

    // 启动服务，并监听
    gulp.task('serve', ['watch'], serveFunc);

    function serveFunc () {
        browserSync.init({
            server: [config.path]
        });
    }
}