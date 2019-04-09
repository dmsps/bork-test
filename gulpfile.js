"use strict";

const gulp = require("gulp"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  cssnano = require("gulp-cssnano"),
  plumber = require("gulp-plumber"),
  newer = require("gulp-newer"),
  gulpif = require("gulp-if"),
  del = require("delete"),
  rename = require("gulp-rename"),
  webpack = require("webpack"),
  webpackStream = require("webpack-stream"),
  imagemin = require("gulp-imagemin"),
  browserSync = require("browser-sync").create();

sass.compiler = require("node-sass");

const config = {
  src: "./src",
  dest: "./build"
};

const webpackConfig = {
  output: {
    filename: "script.js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            env: {
              production: {
                presets: ["minify"]
              }
            }
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  devtool: process.env.NODE_ENV === "development" ? "eval-source-map" : "none"
};

function sassCompiler(done) {
  return gulp
    .src(config.src + "/styles/main.sass", {
      sourcemaps: process.env.NODE_ENV === "development" ? true : false
    })
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulpif(process.env.NODE_ENV === "production", cssnano()))
    .pipe(rename("styles.css"))
    .pipe(
      gulp.dest(config.dest + "/styles", {
        sourcemaps: process.env.NODE_ENV === "development" ? true : false
      })
    )
    .pipe(browserSync.stream());
  done();
}

function scripts(done) {
  return gulp
    .src(config.src + "/**/*.js")
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(config.dest + "/scripts"))
    .pipe(browserSync.stream());
  done();
}

function images(done) {
  return gulp
    .src(config.src + "/img/**/*")
    .pipe(newer(config.dest + "/img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
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
  gulp.parallel(html, sassCompiler, scripts, images, fonts)
);

exports.default = gulp.series(
  gulp.parallel(html, sassCompiler, scripts, images, fonts),
  watch
);
