module.exports = function (gulp, g, config) {
    /**
     * compile scss
     * */

    gulp.task('compileScss', function (done) {
        gulp.src(config.path + config.scssPath + '/app.scss')
            .pipe(g.sass())
            .on('error', onError)
            .pipe(gulp.dest(config.path + config.stylesPath))
            .pipe(g.minifyCss({
                keepSpecialComments: 0
            }))
            .pipe(g.rename({ extname: '.min.css' }))
            .pipe(gulp.dest(config.path + config.stylesPath))
            .on('end', done)
    });

    function onError(err) {
        console.log(err.message);
        this.emit('end')
    }
};