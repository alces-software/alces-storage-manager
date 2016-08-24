/* eslint-disable no-console */
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.js');

var app = express();
var compiler = webpack(config);

var port = 3001;
var host = "0.0.0.0";
var url = "http://" + host + ":" + port;

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler, {
  log: console.log, path: "/__webpack_hmr", heartbeat: 10 * 1000
}));

app.listen(port, host, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at ' + url);
});
