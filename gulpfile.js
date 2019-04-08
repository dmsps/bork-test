"use strict";

const gulp = require("gulp"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  cssnano = require("gulp-cssnano"),
  babel = require("gulp-babel"),
  uglify = require("gulp-uglify"),
  del = require("delete"),
  rename = require("gulp-rename"),
  concat = require("gulp-concat"),
  browserSync = require("browser-sync").create();

sass.compiler = require("node-sass");

const config = {
  src: "./src",
  dest: "./build"
};

const vendorJs = [
  "./node_modules/jquery/dist/jquery.min.js",
  "./node_modules/micromodal/dist/micromodal.min.js",
  "./node_modules/jquery-mask-plugin/dist/jquery.mask.min.js"
];

function sassCompiler(done) {
  return gulp
    .src(config.src + "/styles/main.sass")
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(rename("styles.css"))
    .pipe(gulp.dest(config.dest + "/styles"))
    .pipe(browserSync.stream());
  done();
}

function scripts(done) {
  return gulp
    .src(config.src + "/scripts/**/*.js")
    .pipe(concat("script.js"))
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest(config.dest + "/scripts"))
    .pipe(browserSync.stream());
  done();
}

function vendor(done) {
  return gulp
    .src(vendorJs)
    .pipe(concat("vendor.js"))
    .pipe(uglify())
    .pipe(gulp.dest(config.dest + "/scripts"));
  done();
}

function images(done) {
  return gulp
    .src(config.src + "/img/**/*.{jpg,png,svg}")
    .pipe(gulp.dest(config.dest + "/img"));
  done();
}

function fonts(done) {
  return gulp
    .src(config.src + "/fonts/*")
    .pipe(gulp.dest(config.dest + "/fonts"));
  done();
}

function html(done) {
  return gulp
    .src(config.src + "/*.html")
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
  done();
}

function clean(done) {
  del(["build/*"], done);
}

function watch(done) {
  browserSync.init({
    server: {
      baseDir: "./build"
    }
  });

  gulp.watch(config.src + "/styles/**/*.sass", sassCompiler);
  gulp.watch(config.dest + "/styles/**/*.css", browserSync.reload);
  gulp.watch(config.src + "/*.html", html);
  gulp.watch(config.src + "/scripts/**/*.js", scripts);

  done();
}

exports.build = gulp.series(
  clean,
  gulp.parallel(html, sassCompiler, scripts, vendor, images, fonts)
);

exports.default = gulp.series(
  gulp.parallel(html, sassCompiler, scripts, vendor, images, fonts),
  watch
);
