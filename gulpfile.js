var gulp = require('gulp'),
  istanbul = require('gulp-istanbul'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha'),
  jsdoc = require('gulp-jsdoc3');


gulp.task('lint', function() {
  return gulp.src('./lib/**/*.js')
    .pipe(jshint({}))
    .pipe(jshint.reporter(stylish));
});

gulp.task('pre-test', function () {
  return gulp.src(['./lib/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', gulp.series('pre-test', function() {
  return gulp.src('./test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
}));

gulp.task('doc', function (cb) {
  gulp.src(['./lib/**/*.js'], {read: false})
    .pipe(jsdoc(cb));
});

gulp.task('default', gulp.series('lint', 'test', 'doc'));