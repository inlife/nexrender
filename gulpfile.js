'use strict'

const fs        = require('fs')
const path      = require('path')
const gulp      = require('gulp')
const mocha     = require('gulp-mocha')

const packages  = fs.readdirSync('./packages')

gulp.task('test', function () {
    const tests = packages
        .map(p => path.join('packages', p, 'test', 'index.js'))
        .filter(p => fs.existsSync(p))

    console.log('testing following packages:', tests)

    return gulp.src(tests)
        .pipe(mocha({reporter: 'spec'}))
        // // Creating the reports after tests ran
        // .pipe(istanbul.writeReports())
        // // Enforce a coverage of at least 90%
        // .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});
