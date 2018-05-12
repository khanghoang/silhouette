const http = require('http');
const express = require('express');
const hotware = require('hotware');

const foo = require('./fooMiddleware');

const app = express();
app.use(hotware({
  name: './fooMiddleware',
  directory: './',
  method: 'bar',
  arguments: []
}));
http.createServer(app).listen(8080);
