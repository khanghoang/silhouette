const http = require('http');
const express = require('express')

const foo = () => {
  const app = express();
  app.get('/', (req, res) => {
    res.json({ hello: 'bar13' })
  })
  return app;
} 

module.exports = foo;
