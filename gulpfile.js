var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var reload = browserSync.reload
var sass = require('gulp-sass')
var normalize = require('node-normalize-scss').includePaths
var neat = require('node-neat').includePaths
var cssnano = require('gulp-cssnano')
var imagemin = require('gulp-imagemin')
var runSequence = require('run-sequence')
var nunjucksRender = require('gulp-nunjucks-render')
var htmlreplace = require('gulp-html-replace')
var data = require('gulp-data')
var fs = require('fs')
var uglify = require('gulp-uglify')
var pump = require('pump')

gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'dev',
    },
    open: false,
  })
})

gulp.task('sass', function () {
  return gulp.src('app/scss/*.scss')
    .pipe(sass({
      includePaths: ['sass'].concat(normalize, neat),
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(cssnano({
      zindex: false
    }))
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('images', function () {
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('dev/images'))
})

gulp.task('movejs', function () {
  return gulp.src('app/js/*.+(js)')
    .pipe(gulp.dest('dev/js'))
})

gulp.task('devel', function () {
  console.log(999)
  /*
  * Gets .html and .nunjucks files in pages
  */
  return gulp.src('app/pages/**/*.+(html|nunjucks)')
    /*
    * Renders template with nunjucks
    */
    .pipe(nunjucksRender({
      path: ['app/partials'],
      envOptions: {
        tags: {
          commentStart: '[%',
          commentEnd: '%]'
        }
      }
    }))
    /*
    * output files in app folder
    */
    .pipe(gulp.dest('dev'))
})

/*
 * Ready tasks copy css/images/js from development to production folders
*/

gulp.task('readyjs', function (cb) {
  pump([
    gulp.src('dev/js/*.js'),
    uglify(),
    gulp.dest('dist/js')
  ],
    cb
  )
})

gulp.task('readycss', function () {
  return gulp.src('dev/css/**/*.+(css)')
    .pipe(gulp.dest('dist/css'))
})

gulp.task('readyimages', function () {
  return gulp.src('dev/images/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('dist/images'))
})

gulp.task('readyhtml', function () {
  return gulp.src('dev/**/*.+(html|nunjucks)')
    .pipe(gulp.dest('dist/'))
})

// 'gulp watch' during devel
gulp.task('watch', ['browserSync', 'sass', 'images', 'devel', 'movejs'], function () {
  gulp.watch('app/scss/**/*.+(css|scss)', ['sass'])
  gulp.watch('app/images/**/*.+(png|jpg|gif|svg)', ['images'])
  gulp.watch('app/js/**/*.+(js)', ['movejs'])
  gulp.watch('dev/**/*.html').on('change', reload)
})

// 'gulp prepare' to get layouts and templates ready
gulp.task('prepare', function (callback) {
  runSequence('readyjs', 'readycss', 'readyimages', 'readyhtml', callback)
})

// 'gulp build' tbd, but it will put things where they're supposed to go
