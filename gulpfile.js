var bitcoreTasks = require('bitcore-build');
var gulp = require('gulp');
var tasks = bitcoreTasks('lib');

for (var task in tasks) {
    gulp.task(task, tasks[task])
}
