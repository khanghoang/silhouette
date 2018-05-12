var http = require('http'),
  express = require('express'),
  meddleware = require('meddleware'),
  config = require('shush')('./config/middleware');

var app = express();
app.use(meddleware(config)); // or app.use('/foo', meddleware(config));
http.createServer(app).listen(8080);
