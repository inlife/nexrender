var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');

gulp.task('test', function () {
  return gulp.src(['test/*.js'])
    .pipe(mocha({reporter: 'spec'}))
    // // Creating the reports after tests ran
    // .pipe(istanbul.writeReports())
    // // Enforce a coverage of at least 90%
    // .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});


gulp.task('lint', function() {
  return gulp.src(['*.js', 'lib/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});
