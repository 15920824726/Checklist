var gulp = require('gulp'),
    config = require('./gulp/gulp.config')(),
    g = require('gulp-load-plugins')({lazy: false}),
    fs = require('fs'),
    del = require('del'),
    gulpTaskList = fs.readdirSync('./gulp/tasks');

gulpTaskList.forEach(function(taskfile) {
	if (taskfile.substring(0,1) != '.') {
 		require('./gulp/tasks/' + taskfile)(gulp, g, config);
	}
});
