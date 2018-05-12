const http = require('http');
const express = require('express');
const hotware = require('hotware');

const foo = require('./fooMiddleware');

const app = express();
app.use(hotware({
  name: './fooMiddleware',
  directory: './testFolder',
  method: 'bar',
  arguments: [],
  beforeHotReload: './log',
  afterHotReload: './log'
}));
http.createServer(app).listen(8080);
