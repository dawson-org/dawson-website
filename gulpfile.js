const gulp = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const connect = require('gulp-connect');
const pug = require('gulp-pug');
const pugInheritance = require('gulp-pug-inheritance');
const stylus = require('gulp-stylus');
const nib = require('nib');
const rupture = require('rupture');
const changed = require('gulp-changed');
const filter = require('gulp-filter');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const remote = require('gulp-remote-src');

const REMOTE_README = 'https://raw.githubusercontent.com/dawson-org/dawson-cli/master/docs/';

const plumberOpts = {
  errorHandler: (err) => { console.log(err); },
};


gulp.task('clean', (cb) => {
  del.sync(['./docs/'], cb);
});


gulp.task('serve', () => (
  connect.server({
    root: './docs',
    livereload: true,
    host: '0.0.0.0',
    port: process.env.PORT || 1337,
  })
));


gulp.task('README', () => {
  remote(
    'README.md',
    { base: REMOTE_README }
  )
    .pipe(gulp.dest('./src', { overwrite: true }))
});


gulp.task('layout', ['README'], () => (
  gulp
    .src([
      './src/*.pug',
    ])
    .pipe(changed('./docs', { extension: '.html' }))
    .pipe(plumber(plumberOpts))
    .pipe(pugInheritance({ basedir: 'src', skip: 'node_modules' }))
    .pipe(filter(file => (!/\/_/.test(file.path) && !/^_/.test(file.relative))))
    .pipe(pug())
    .pipe(gulp.dest('./docs'))
    .pipe(connect.reload())
));


gulp.task('style', () => (
  gulp
    .src(['./src/css/*.styl'])
    .pipe(changed('./docs/css', { extension: '.css' }))
    .pipe(plumber(plumberOpts))
    .pipe(stylus({ compress: true, use: [nib(), rupture()] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./docs/css'))
    .pipe(connect.reload())
));


gulp.task('imgs', () => (
  gulp
    .src(['./src/img/**/*'])
    .pipe(changed('./docs/img'))
    .pipe(plumber(plumberOpts))
    .pipe(gulp.dest('./docs/img'))
    .pipe(connect.reload())
));


gulp.task('js', () => (
  gulp
    .src(['./src/js/**/*.js'])
    .pipe(changed('./docs/js', { extension: '.js' }))
    .pipe(plumber(plumberOpts))
    .pipe(uglify({ compress: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./docs/js'))
    .pipe(connect.reload())
));


gulp.task('CNAME', () => (
  gulp
    .src(['./src/CNAME'])
    .pipe(gulp.dest('./docs'))
    .pipe(connect.reload())
));


gulp.task('watch', () => {
  gulp.watch(['./src/*.pug', './src/*.md'], ['layout']);
  gulp.watch('./src/css/*.styl', ['style']);
  gulp.watch('./src/img/**/*', ['imgs']);
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/CNAME', ['CNAME']);
});



gulp.task('default', ['clean', 'README', 'layout', 'style', 'imgs', 'js', 'CNAME', 'watch', 'serve']);
gulp.task('build', ['clean', 'README', 'layout', 'style', 'imgs', 'js', 'CNAME']);