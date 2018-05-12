const http = require('http');
const express = require('express');
const hotware = require('hotware');

const foo = require('./fooMiddleware');

const app = express();
app.use(foo.bar());
http.createServer(app).listen(8080);
