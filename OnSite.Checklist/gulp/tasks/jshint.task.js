module.exports = function (gulp, g, config) {

    gulp.task('jshint', jshintFunc);

    function jshintFunc() {
        return gulp.src(config.jsPath)
            .pipe(g.jshint())
            .pipe(g.jshint.reporter('default', {verbose: true}));
    }
};