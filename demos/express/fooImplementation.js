const http = require('http');
const express = require('express')

const foo = {
  bar: () => {
    const app = express();
    app.get('/', (req, res) => {
      res.json({ hello: '1112123123' })
    })
    app.get('/bar', (req, res) => {
      res.json({ hello: 'bar3' })
    })
    return app;
  } 
}

module.exports = foo;
